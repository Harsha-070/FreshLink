const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../data/db');
const { getDistanceKm, estimateDeliveryCost } = require('../utils/distance');

const router = express.Router();

// POST /api/matching/find
router.post('/find', authenticateToken, (req, res) => {
  const { requirements, buyerLat, buyerLng, maxDistanceKm } = req.body;
  const maxDist = maxDistanceKm || 4;
  if (!requirements || requirements.length === 0) return res.status(400).json({ error: 'Requirements required' });

  const lat = buyerLat || 17.3850;
  const lng = buyerLng || 78.4867;
  const vendors = db.users.filter((u) => u.role === 'vendor');
  const results = [];

  requirements.forEach((reqItem) => {
    const itemName = reqItem.name.toLowerCase();
    const qtyNeeded = reqItem.quantity;

    const matchingStock = db.stock.filter(
      (s) => s.quantity > 0 && s.name.toLowerCase().includes(itemName)
    );

    const vendorMatches = [];
    matchingStock.forEach((stock) => {
      const vendor = vendors.find((v) => v.id === stock.vendorId);
      if (!vendor) return;
      const distance = getDistanceKm(lat, lng, vendor.location.lat, vendor.location.lng);
      if (distance > maxDist) return;

      vendorMatches.push({
        vendorId: vendor.id, vendorName: vendor.name, vendorRating: vendor.rating,
        vendorAddress: vendor.location.address, distance,
        deliveryCost: estimateDeliveryCost(distance), stockId: stock.id,
        availableQty: stock.quantity,
        pricePerKg: stock.isSurplus && stock.discountPrice ? stock.discountPrice : stock.pricePerKg,
        originalPrice: stock.pricePerKg, isSurplus: stock.isSurplus,
        unit: stock.unit, expiryDate: stock.expiryDate,
      });
    });

    vendorMatches.sort((a, b) => a.distance - b.distance || a.pricePerKg - b.pricePerKg);
    results.push({
      item: reqItem.name, quantityNeeded: qtyNeeded, unit: reqItem.unit || 'kg',
      matches: vendorMatches,
      canFulfill: vendorMatches.reduce((sum, m) => sum + m.availableQty, 0) >= qtyNeeded,
    });
  });

  const fulfillmentPlan = buildPlan(results);
  res.json({ results, fulfillmentPlan });
});

// GET /api/matching/nearby-vendors
router.get('/nearby-vendors', (req, res) => {
  const { lat, lng, radius } = req.query;
  const buyerLat = Number(lat) || 17.3850;
  const buyerLng = Number(lng) || 78.4867;
  const maxDist = Number(radius) || 4;

  const vendors = db.users.filter((u) => u.role === 'vendor');

  const nearbyVendors = vendors.map((vendor) => {
    const distance = getDistanceKm(buyerLat, buyerLng, vendor.location.lat, vendor.location.lng);
    const vendorStock = db.stock.filter((s) => s.vendorId === vendor.id && s.quantity > 0);
    return {
      id: vendor.id, name: vendor.name, rating: vendor.rating, address: vendor.location.address,
      distance, deliveryCost: estimateDeliveryCost(distance),
      totalItems: vendorStock.length,
      surplusItems: vendorStock.filter((s) => s.isSurplus).length,
      topItems: vendorStock.slice(0, 5).map((s) => ({
        name: s.name, pricePerKg: s.isSurplus && s.discountPrice ? s.discountPrice : s.pricePerKg,
        originalPrice: s.pricePerKg, quantity: s.quantity, isSurplus: s.isSurplus, image: s.image,
      })),
    };
  }).filter((v) => v.distance <= maxDist).sort((a, b) => a.distance - b.distance);

  res.json({ vendors: nearbyVendors, total: nearbyVendors.length });
});

function buildPlan(results) {
  const plan = [];
  let totalCost = 0, totalDelivery = 0;

  results.forEach((result) => {
    let remaining = result.quantityNeeded;
    const sources = [];
    for (const match of result.matches) {
      if (remaining <= 0) break;
      const qty = Math.min(remaining, match.availableQty);
      const cost = qty * match.pricePerKg;
      sources.push({ vendorId: match.vendorId, vendorName: match.vendorName, quantity: qty, pricePerKg: match.pricePerKg, cost, distance: match.distance, deliveryCost: match.deliveryCost });
      totalCost += cost;
      totalDelivery += match.deliveryCost;
      remaining -= qty;
    }
    plan.push({ item: result.item, quantityNeeded: result.quantityNeeded, fulfilled: result.quantityNeeded - remaining, sources, fullyFulfilled: remaining <= 0 });
  });

  return { items: plan, totalItemCost: Math.round(totalCost), totalDeliveryCost: Math.round(totalDelivery), grandTotal: Math.round(totalCost + totalDelivery) };
}

module.exports = router;
