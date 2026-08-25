import React, { useState } from "react";
import { useGym } from "../../context/GymContext";
import { EquipmentItem, MaintenanceLog, StockPurchase, SupplementProduct, LockerItem } from "../../types/gym";
import { exportToCSV, exportToExcel, exportToPrintPDF } from "../../utils/exportUtils";
import {
  Lock,
  Wrench,
  ShieldCheck,
  AlertCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  DollarSign,
  Truck,
  Layers,
  AlertTriangle,
  FileText,
  ShoppingBag,
  Download,
  Printer,
  Trash2,
  Edit2,
  Activity,
  ArrowRight,
  TrendingDown
} from "lucide-react";

export const InventoryLockers: React.FC = () => {
  const {
    lockers,
    equipment,
    maintenanceLogs,
    stockPurchases,
    supplements,
    selectedBranchId,
    branches,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addMaintenanceLog,
    addStockPurchase,
    addSupplement,
    updateSupplement
  } = useGym();

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0] || { id: "all", name: "All Branches" };

  // Sub-Tab State
  const [activeTab, setActiveTab] = useState<"equipment" | "maintenance" | "supplements" | "purchases" | "lockers">("equipment");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Equipment Modals State
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);
  const [eqName, setEqName] = useState("");
  const [eqCategory, setEqCategory] = useState<EquipmentItem["category"]>("Strength Machines");
  const [eqSerial, setEqSerial] = useState("");
  const [eqModel, setEqModel] = useState("");
  const [eqPurchaseDate, setEqPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [eqPurchaseCost, setEqPurchaseCost] = useState<number>(0);
  const [eqWarrantyExpiry, setEqWarrantyExpiry] = useState("");
  const [eqNextServiceDate, setEqNextServiceDate] = useState(new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0]);
  const [eqStatus, setEqStatus] = useState<EquipmentItem["status"]>("Operational");
  const [eqVendorName, setEqVendorName] = useState("");
  const [eqVendorPhone, setEqVendorPhone] = useState("");

  // Maintenance Log Modal State
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedEqIdForService, setSelectedEqIdForService] = useState("");
  const [serviceType, setServiceType] = useState<MaintenanceLog["serviceType"]>("Routine AMC");
  const [serviceCost, setServiceCost] = useState<number>(0);
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [serviceTechName, setServiceTechName] = useState("");
  const [serviceTechPhone, setServiceTechPhone] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState(new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0]);
  const [serviceStatus, setServiceStatus] = useState<MaintenanceLog["status"]>("Completed");

  // Purchase Order Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseProductId, setPurchaseProductId] = useState(supplements[0]?.id || "");
  const [purchaseVendor, setPurchaseVendor] = useState("");
  const [purchaseInvoice, setPurchaseInvoice] = useState("");
  const [purchaseQty, setPurchaseQty] = useState<number>(10);
  const [purchaseUnitCost, setPurchaseUnitCost] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);

  // Product Add / Edit Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodBarcode, setProdBarcode] = useState("");
  const [prodCategory, setProdCategory] = useState<SupplementProduct["category"]>("Protein");
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodCostPrice, setProdCostPrice] = useState<number>(0);
  const [prodStock, setProdStock] = useState<number>(0);
  const [prodMinThreshold, setProdMinThreshold] = useState<number>(5);
  const [prodBrand, setProdBrand] = useState("");

  // Scoped Data
  const branchLockers = selectedBranchId === "all" ? lockers : lockers.filter((l) => l.branchId === selectedBranchId);
  const branchEquipment = selectedBranchId === "all" ? equipment : equipment.filter((eq) => eq.branchId === selectedBranchId);
  const branchMaintenance = selectedBranchId === "all" ? maintenanceLogs : maintenanceLogs.filter((m) => m.branchId === selectedBranchId);
  const branchPurchases = selectedBranchId === "all" ? stockPurchases : stockPurchases.filter((p) => p.branchId === selectedBranchId);

  // Low Stock Calculation
  const lowStockSupplements = supplements.filter((p) => (p.stockQty || 0) <= (p.minStockThreshold || 5));

  // Filtered Equipment
  const filteredEquipment = branchEquipment.filter((eq) => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.serialNumber && eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      eq.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || eq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered Supplements
  const filteredSupplements = supplements.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // =========================================================
  // HANDLERS
  // =========================================================
  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqName.trim()) return;

    if (editingEquipmentId) {
      await updateEquipment(editingEquipmentId, {
        name: eqName.trim(),
        category: eqCategory,
        serialNumber: eqSerial.trim(),
        modelNumber: eqModel.trim(),
        purchaseDate: eqPurchaseDate,
        purchaseCost: eqPurchaseCost,
        warrantyExpiry: eqWarrantyExpiry,
        nextServiceDate: eqNextServiceDate,
        status: eqStatus,
        vendorName: eqVendorName.trim(),
        vendorPhone: eqVendorPhone.trim(),
      });
      setEditingEquipmentId(null);
    } else {
      await addEquipment({
        name: eqName.trim(),
        category: eqCategory,
        serialNumber: eqSerial.trim() || ("SN-" + Math.floor(10000 + Math.random() * 90000)),
        modelNumber: eqModel.trim(),
        branchId: selectedBranchId === "all" ? "branch-1" : selectedBranchId,
        purchaseDate: eqPurchaseDate,
        purchaseCost: eqPurchaseCost,
        warrantyExpiry: eqWarrantyExpiry,
        nextServiceDate: eqNextServiceDate,
        status: eqStatus,
        vendorName: eqVendorName.trim(),
        vendorPhone: eqVendorPhone.trim(),
      });
    }

    setShowAddEquipmentModal(false);
    resetEqForm();
  };

  const resetEqForm = () => {
    setEditingEquipmentId(null);
    setEqName("");
    setEqCategory("Strength Machines");
    setEqSerial("");
    setEqModel("");
    setEqPurchaseCost(0);
    setEqVendorName("");
    setEqVendorPhone("");
  };

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqIdForService || serviceCost < 0) return;

    const targetEq = equipment.find((eq) => eq.id === selectedEqIdForService);
    await addMaintenanceLog({
      equipmentId: selectedEqIdForService,
      equipmentName: targetEq?.name || "Fitness Equipment",
      branchId: selectedBranchId === "all" ? "branch-1" : selectedBranchId,
      serviceDate,
      technicianName: serviceTechName.trim() || "Apex Fitness Service",
      technicianPhone: serviceTechPhone.trim(),
      cost: serviceCost,
      serviceType,
      description: serviceDesc.trim() || "Routine inspection and calibration completed.",
      nextFollowUpDate: nextFollowUp,
      status: serviceStatus,
    });

    setShowMaintenanceModal(false);
  };

  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseProductId || purchaseQty <= 0) return;

    const targetProd = supplements.find((p) => p.id === purchaseProductId);
    const total = purchaseQty * purchaseUnitCost;

    await addStockPurchase({
      productId: purchaseProductId,
      productName: targetProd?.name || "Supplement Product",
      branchId: selectedBranchId === "all" ? "branch-1" : selectedBranchId,
      vendorName: purchaseVendor.trim() || "Direct Nutrition Distributors",
      invoiceNumber: purchaseInvoice.trim() || ("INV-" + Math.floor(1000 + Math.random() * 9000)),
      quantity: purchaseQty,
      unitCost: purchaseUnitCost,
      totalCost: total,
      purchaseDate,
    });

    setShowPurchaseModal(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || prodPrice <= 0) return;

    await addSupplement({
      name: prodName.trim(),
      barcode: prodBarcode.trim() || String(Math.floor(100000000000 + Math.random() * 900000000000)),
      category: prodCategory,
      price: prodPrice,
      costPrice: prodCostPrice,
      stockQty: prodStock,
      minStockThreshold: prodMinThreshold,
      brand: prodBrand.trim(),
      gstPercent: 18,
      imageUrl: "",
    });

    setShowProductModal(false);
    setProdName("");
    setProdPrice(0);
    setProdStock(0);
  };

  // =========================================================
  // EXPORT HANDLERS
  // =========================================================
  const handleExportEquipment = (format: "pdf" | "csv" | "excel") => {
    const headers = ["Equipment Name", "Category", "Serial #", "Status", "Purchase Cost (₹)", "Last Service", "Next Service Due"];
    const rows = branchEquipment.map((eq) => [
      eq.name,
      eq.category,
      eq.serialNumber || "—",
      eq.status,
      eq.purchaseCost || 0,
      eq.lastServiceDate || "—",
      eq.nextServiceDate || "—"
    ]);

    const prefix = "SmartGym_EquipmentFleet_" + currentBranch.name;
    if (format === "csv") {
      exportToCSV(prefix, headers, rows);
    } else if (format === "excel") {
      exportToExcel(prefix, headers, rows);
    } else {
      exportToPrintPDF({
        title: "Gym Equipment & Asset Fleet Audit",
        subtitle: "Asset Register, AMC & Health Status",
        branchName: currentBranch.name,
        summaryStats: [
          { label: "Total Machines", value: branchEquipment.length },
          { label: "Operational", value: branchEquipment.filter((e) => e.status === "Operational").length },
          { label: "Needs Service", value: branchEquipment.filter((e) => e.status !== "Operational").length }
        ],
        headers,
        rows
      });
    }
  };

  const handleExportSupplements = (format: "pdf" | "csv" | "excel") => {
    const headers = ["Product Name", "Barcode / SKU", "Category", "Selling Price (₹)", "Cost Price (₹)", "In Stock", "Stock Status"];
    const rows = supplements.map((p) => [
      p.name,
      p.barcode,
      p.category,
      p.price,
      p.costPrice || 0,
      p.stockQty,
      p.stockQty <= (p.minStockThreshold || 5) ? "LOW STOCK" : "IN STOCK"
    ]);

    const prefix = "SmartGym_SupplementInventory_" + currentBranch.name;
    if (format === "csv") {
      exportToCSV(prefix, headers, rows);
    } else if (format === "excel") {
      exportToExcel(prefix, headers, rows);
    } else {
      exportToPrintPDF({
        title: "Supplement Inventory & Stock Status",
        subtitle: "Stock Level, Valuation & Reorder Thresholds",
        branchName: currentBranch.name,
        summaryStats: [
          { label: "Total SKUs", value: supplements.length },
          { label: "Low Stock Items", value: lowStockSupplements.length },
          { label: "Stock Valuation", value: "₹" + supplements.reduce((s, p) => s + p.price * p.stockQty, 0).toLocaleString() }
        ],
        headers,
        rows
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-xs">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#14171F] via-[#1A1F2C] to-[#14171F] border border-gym-border shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30">
              Operations & Assets Hub
            </span>
            <span className="text-slate-400 font-bold">• {currentBranch.name}</span>
          </div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#27D980]" />
            <span>Equipment, Supplement Inventory & Lockers Studio</span>
          </h2>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExportEquipment("pdf")}
            className="px-3.5 py-2 rounded-xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Fleet Audit</span>
          </button>

          <button
            onClick={() => handleExportEquipment("csv")}
            className="px-3.5 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Low-Stock Alert Banner */}
      {lowStockSupplements.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-900/30 via-yellow-900/20 to-[#101422] border border-amber-500/40 shadow-xl flex items-center justify-between flex-wrap gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-300">
                Low Stock Warning: {lowStockSupplements.length} product(s) below reorder threshold!
              </h4>
              <p className="text-[10px] text-slate-300">
                {lowStockSupplements.map((p) => p.name + " (" + p.stockQty + " left)").join(", ")}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab("purchases");
              setShowPurchaseModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black flex items-center gap-1 shadow-md cursor-pointer"
          >
            <span>+ Create Purchase Order</span>
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-gym-border/40 scrollbar-none">
        {[
          { id: "equipment", label: "Equipment Fleet (" + branchEquipment.length + ")", icon: Wrench },
          { id: "maintenance", label: "Maintenance & AMC (" + branchMaintenance.length + ")", icon: Activity },
          { id: "supplements", label: "Supplement Stock (" + supplements.length + ")", icon: ShoppingBag },
          { id: "purchases", label: "Stock Purchases (" + branchPurchases.length + ")", icon: Truck },
          { id: "lockers", label: "Smart Lockers (" + branchLockers.length + ")", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setCategoryFilter("ALL");
              }}
              className={"px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap " + (
                isActive
                  ? "bg-[#4F7CFF] text-white shadow-md shadow-[#4F7CFF]/20"
                  : "bg-[#101422] text-slate-400 hover:text-white border border-white/5"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: EQUIPMENT FLEET REGISTER                           */}
      {/* ========================================================= */}
      {activeTab === "equipment" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search machine by name or serial #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#101422] border border-white/10 focus:border-[#4F7CFF] rounded-xl pl-9 pr-3 py-2 text-white outline-none"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#101422] border border-white/10 rounded-xl px-3 py-2 text-white outline-none font-bold"
              >
                <option value="ALL">All Categories</option>
                <option value="Cardio">Cardio</option>
                <option value="Strength Machines">Strength Machines</option>
                <option value="Free Weights">Free Weights</option>
                <option value="Benches & Racks">Benches & Racks</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowMaintenanceModal(true);
                  if (equipment.length > 0) setSelectedEqIdForService(equipment[0].id);
                }}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Log Service / Repair</span>
              </button>

              <button
                onClick={() => {
                  resetEqForm();
                  setShowAddEquipmentModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Machine</span>
              </button>
            </div>
          </div>

          <div className="bg-[#101422] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0E17] text-slate-400 uppercase font-black text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Equipment / Model</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Serial #</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Last Service</th>
                    <th className="p-3.5">Next AMC Due</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEquipment.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                        No equipment records found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredEquipment.map((eq) => (
                      <tr key={eq.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          <div className="font-black text-white">{eq.name}</div>
                          {eq.modelNumber && <span className="text-[10px] text-slate-400">{eq.modelNumber}</span>}
                        </td>
                        <td className="p-3.5 text-slate-300">{eq.category}</td>
                        <td className="p-3.5 font-mono text-[#4F7CFF]">{eq.serialNumber || "—"}</td>
                        <td className="p-3.5">
                          <span className={"px-2.5 py-1 rounded-full text-[10px] font-bold border " + (
                            eq.status === "Operational"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : eq.status === "Under Maintenance"
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          )}>
                            {eq.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400">{eq.lastServiceDate || "—"}</td>
                        <td className="p-3.5 font-bold text-amber-400">{eq.nextServiceDate || "—"}</td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedEqIdForService(eq.id);
                              setShowMaintenanceModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400"
                            title="Schedule Service"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingEquipmentId(eq.id);
                              setEqName(eq.name);
                              setEqCategory(eq.category);
                              setEqSerial(eq.serialNumber || "");
                              setEqModel(eq.modelNumber || "");
                              setEqPurchaseDate(eq.purchaseDate);
                              setEqPurchaseCost(eq.purchaseCost || 0);
                              setEqWarrantyExpiry(eq.warrantyExpiry || "");
                              setEqNextServiceDate(eq.nextServiceDate);
                              setEqStatus(eq.status);
                              setEqVendorName(eq.vendorName || "");
                              setEqVendorPhone(eq.vendorPhone || "");
                              setShowAddEquipmentModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteEquipment(eq.id)}
                            className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MAINTENANCE & SERVICE LOGS                         */}
      {/* ========================================================= */}
      {activeTab === "maintenance" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Equipment Service & AMC Maintenance History ({branchMaintenance.length})</span>
            </h3>
            <button
              onClick={() => {
                setShowMaintenanceModal(true);
                if (equipment.length > 0) setSelectedEqIdForService(equipment[0].id);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Log Maintenance Event</span>
            </button>
          </div>

          <div className="bg-[#101422] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0E17] text-slate-400 uppercase font-black text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Service Date</th>
                    <th className="p-3.5">Machine Name</th>
                    <th className="p-3.5">Service Type</th>
                    <th className="p-3.5">Technician / Vendor</th>
                    <th className="p-3.5">Description & Findings</th>
                    <th className="p-3.5">Cost (₹)</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {branchMaintenance.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                        No maintenance events recorded yet. Click above to log equipment service.
                      </td>
                    </tr>
                  ) : (
                    branchMaintenance.map((m) => (
                      <tr key={m.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-[#4F7CFF]">{m.serviceDate}</td>
                        <td className="p-3.5 font-black text-white">{m.equipmentName}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            {m.serviceType}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <div>{m.technicianName}</div>
                          {m.technicianPhone && <span className="text-[10px] text-slate-400">{m.technicianPhone}</span>}
                        </td>
                        <td className="p-3.5 text-slate-300 max-w-xs">{m.description}</td>
                        <td className="p-3.5 font-black text-rose-400">₹{(m.cost || 0).toLocaleString()}</td>
                        <td className="p-3.5 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SUPPLEMENTS STORE & INVENTORY                     */}
      {/* ========================================================= */}
      {activeTab === "supplements" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#101422] border border-white/10 focus:border-[#27D980] rounded-xl pl-9 pr-3 py-2 text-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportSupplements("pdf")}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Stock Report</span>
              </button>

              <button
                onClick={() => setShowProductModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Product SKU</span>
              </button>
            </div>
          </div>

          <div className="bg-[#101422] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0E17] text-slate-400 uppercase font-black text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Barcode / SKU</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Selling Price</th>
                    <th className="p-3.5">Cost Price</th>
                    <th className="p-3.5">Current Stock</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSupplements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                        No supplement products in catalogue. Click above to add products.
                      </td>
                    </tr>
                  ) : (
                    filteredSupplements.map((p) => {
                      const isLowStock = (p.stockQty || 0) <= (p.minStockThreshold || 5);
                      return (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5 font-black text-white">{p.name}</td>
                          <td className="p-3.5 font-mono text-slate-400">{p.barcode}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-3.5 font-black text-[#27D980]">₹{p.price.toLocaleString()}</td>
                          <td className="p-3.5 text-slate-400">₹{(p.costPrice || 0).toLocaleString()}</td>
                          <td className="p-3.5">
                            <span className={"px-2.5 py-1 rounded-full text-[10px] font-black border " + (
                              isLowStock
                                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            )}>
                              {p.stockQty} Units {isLowStock ? "(LOW STOCK)" : ""}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setPurchaseProductId(p.id);
                                setPurchaseUnitCost(p.costPrice || 0);
                                setShowPurchaseModal(true);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/30 active:scale-95"
                            >
                              + Restock
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: STOCK PURCHASES & INVOICES                         */}
      {/* ========================================================= */}
      {activeTab === "purchases" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#4F7CFF]" />
              <span>Stock Purchase Orders & Replenishment Logs ({branchPurchases.length})</span>
            </h3>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Stock Purchase</span>
            </button>
          </div>

          <div className="bg-[#101422] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0E17] text-slate-400 uppercase font-black text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Vendor</th>
                    <th className="p-3.5 text-center">Quantity</th>
                    <th className="p-3.5">Unit Cost</th>
                    <th className="p-3.5 text-right">Total Outflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {branchPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                        No purchase orders recorded yet. Restock items above to auto-log purchase orders.
                      </td>
                    </tr>
                  ) : (
                    branchPurchases.map((po) => (
                      <tr key={po.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-[#4F7CFF]">{po.purchaseDate}</td>
                        <td className="p-3.5 font-mono text-slate-300">{po.invoiceNumber}</td>
                        <td className="p-3.5 font-black text-white">{po.productName}</td>
                        <td className="p-3.5 text-slate-300">{po.vendorName}</td>
                        <td className="p-3.5 text-center font-bold text-white">+{po.quantity}</td>
                        <td className="p-3.5 text-slate-300">₹{po.unitCost.toLocaleString()}</td>
                        <td className="p-3.5 font-black text-rose-400 text-right text-sm">₹{po.totalCost.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: SMART LOCKER ALLOCATIONS                           */}
      {/* ========================================================= */}
      {activeTab === "lockers" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#4F7CFF]" />
                <span>Smart Locker Allocations ({branchLockers.length} Lockers)</span>
              </h3>
              <p className="text-[10px] text-slate-400">Live locker occupancy map and assigned member records</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {branchLockers.map((locker) => (
              <div
                key={locker.id}
                className={"p-4 rounded-2xl border text-center transition-all " + (
                  locker.status === "Occupied"
                    ? "bg-[#14171F] border-[#4F7CFF]/50 shadow-md shadow-[#4F7CFF]/10"
                    : locker.status === "Available"
                    ? "bg-[#0B0D12] border-emerald-500/40 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                )}
              >
                <div className="text-sm font-extrabold text-white">{locker.lockerNumber}</div>
                <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 " + (
                  locker.status === "Occupied" ? "bg-[#4F7CFF]/20 text-[#4F7CFF]" : "bg-emerald-500/15 text-emerald-400"
                )}>
                  {locker.status}
                </span>

                {locker.assignedMemberName && (
                  <div className="mt-2 text-[11px] text-slate-300 font-medium line-clamp-1">
                    {locker.assignedMemberName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT EQUIPMENT                               */}
      {/* ========================================================= */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101422] border border-white/15 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white">
                {editingEquipmentId ? "Edit Machine" : "Add New Machine / Equipment"}
              </h3>
              <button
                onClick={() => setShowAddEquipmentModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Life Fitness Platinum Treadmill"
                  value={eqName}
                  onChange={(e) => setEqName(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Category</label>
                  <select
                    value={eqCategory}
                    onChange={(e) => setEqCategory(e.target.value as any)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Cardio">Cardio</option>
                    <option value="Strength Machines">Strength Machines</option>
                    <option value="Free Weights">Free Weights</option>
                    <option value="Benches & Racks">Benches & Racks</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Recovery & Spa">Recovery & Spa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Condition Status</label>
                  <select
                    value={eqStatus}
                    onChange={(e) => setEqStatus(e.target.value as any)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Needs Inspection">Needs Inspection</option>
                    <option value="Out of Order">Out of Order</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Serial / Asset #</label>
                  <input
                    type="text"
                    placeholder="e.g. LF-TM-004"
                    value={eqSerial}
                    onChange={(e) => setEqSerial(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={eqPurchaseCost || ""}
                    onChange={(e) => setEqPurchaseCost(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={eqPurchaseDate}
                    onChange={(e) => setEqPurchaseDate(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Next AMC Service Date</label>
                  <input
                    type="date"
                    value={eqNextServiceDate}
                    onChange={(e) => setEqNextServiceDate(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black text-xs shadow-xl cursor-pointer transition-all"
              >
                {editingEquipmentId ? "Save Machine Details" : "Add Equipment to Fleet"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: LOG MAINTENANCE / SERVICE EVENT                    */}
      {/* ========================================================= */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101422] border border-white/15 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white">Log Equipment Service / Repair</h3>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMaintenance} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Select Machine *</label>
                <select
                  value={selectedEqIdForService}
                  onChange={(e) => setSelectedEqIdForService(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none font-bold"
                >
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.serialNumber || eq.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Service Type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Routine AMC">Routine AMC</option>
                    <option value="Emergency Repair">Emergency Repair</option>
                    <option value="Part Replacement">Part Replacement</option>
                    <option value="Safety Inspection">Safety Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Service Cost (₹)</label>
                  <input
                    type="number"
                    value={serviceCost || ""}
                    onChange={(e) => setServiceCost(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-rose-400 font-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Service Date</label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Technician / Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Fit Care"
                    value={serviceTechName}
                    onChange={(e) => setServiceTechName(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Work Description & Parts Replaced</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Replaced pulley cable wire and greased motor track"
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 text-white font-black text-xs shadow-xl cursor-pointer transition-all"
              >
                Log Maintenance Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE STOCK PURCHASE ORDER                        */}
      {/* ========================================================= */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101422] border border-white/15 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white">Create Stock Purchase Order</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Select Supplement Product *</label>
                <select
                  value={purchaseProductId}
                  onChange={(e) => {
                    setPurchaseProductId(e.target.value);
                    const prod = supplements.find((p) => p.id === e.target.value);
                    if (prod?.costPrice) setPurchaseUnitCost(prod.costPrice);
                  }}
                  className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none font-bold"
                >
                  {supplements.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.stockQty} in stock)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Vendor / Distributor</label>
                  <input
                    type="text"
                    placeholder="e.g. Optimum Nutrition India"
                    value={purchaseVendor}
                    onChange={(e) => setPurchaseVendor(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Invoice Number</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-981"
                    value={purchaseInvoice}
                    onChange={(e) => setPurchaseInvoice(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Quantity Received *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={purchaseQty || ""}
                    onChange={(e) => setPurchaseQty(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-[#27D980] font-black text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Unit Cost Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={purchaseUnitCost || ""}
                    onChange={(e) => setPurchaseUnitCost(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#0B0E17] border border-white/5 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Total Purchase Value:</span>
                <span className="text-sm font-black text-[#27D980]">₹{(purchaseQty * purchaseUnitCost).toLocaleString()}</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black text-xs shadow-xl cursor-pointer transition-all"
              >
                Confirm Purchase & Restock Inventory 📦
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD SUPPLEMENT PRODUCT SKU                         */}
      {/* ========================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101422] border border-white/15 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white">Add Supplement Product SKU</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold Standard 100% Whey 2kg"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#27D980]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Protein">Protein</option>
                    <option value="Pre-Workout">Pre-Workout</option>
                    <option value="Creatine">Creatine</option>
                    <option value="BCAA">BCAA</option>
                    <option value="Vitamins">Vitamins</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Optimum Nutrition"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice || ""}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-[#27D980] font-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={prodCostPrice || ""}
                    onChange={(e) => setProdCostPrice(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Initial Stock Qty</label>
                  <input
                    type="number"
                    value={prodStock || ""}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Min. Alert Threshold</label>
                  <input
                    type="number"
                    value={prodMinThreshold || ""}
                    onChange={(e) => setProdMinThreshold(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black text-xs shadow-xl cursor-pointer transition-all"
              >
                Create Product SKU
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
