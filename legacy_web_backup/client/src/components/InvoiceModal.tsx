import React from 'react';
import { Invoice } from '../types';
import { X, Printer, Download, ShieldCheck, QrCode, CheckCircle2, Fuel } from 'lucide-react';

interface InvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const quantity = parseFloat(invoice.quantity_delivered as string || invoice.quantity_requested as string || '35');
  const rate = parseFloat(invoice.rate_per_litre as string || '104.21');
  const subtotal = parseFloat(invoice.fuel_subtotal as string || '3647.35');
  const deliveryFee = parseFloat(invoice.delivery_fee as string || '50');
  const platformMarkup = parseFloat(invoice.platform_markup as string || '0');
  const total = parseFloat(invoice.total_amount as string || '3697.35');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b1120] rounded-3xl border border-orange-500/30 shadow-2xl overflow-hidden text-slate-100 my-8">
        
        {/* Modal Action Bar */}
        <div className="flex items-center justify-between p-4 px-6 bg-slate-900/80 border-b border-white/10 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Tax Invoice & PESO Compliance Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-white/10"
            >
              <Printer className="w-3.5 h-3.5 text-orange-400" /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-6 md:p-8 space-y-6" id="printable-invoice">
          
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <Fuel className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white font-display">
                  Fuel<span className="text-orange-400">Track</span>
                </h1>
                <p className="text-xs text-slate-400">Doorstep Energy Logistics & PESO Refuelling Operations</p>
                <p className="text-[10px] text-slate-500 font-mono">GSTIN: 27AABCF1234F1Z9 • CIN: U60200MH2026PTC88910</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                PAID & DELIVERED
              </span>
              <div className="text-sm font-bold font-mono text-orange-400 mt-2">
                {invoice.invoice_number}
              </div>
              <div className="text-[11px] text-slate-400">
                Date: {new Date(invoice.created_at || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Customer & Delivery Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To:
              </span>
              <div className="font-bold text-slate-100 text-sm">{invoice.customer_name}</div>
              <div className="text-slate-300 mt-0.5">{invoice.customer_address}</div>
              {invoice.customer_phone && <div className="text-slate-400 mt-0.5">Phone: {invoice.customer_phone}</div>}
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Delivery Verification:
              </span>
              <div>Tanker Unit: <strong className="text-slate-200">{invoice.tanker_code || 'TK-101 Mumbai Express'}</strong></div>
              <div>Fuel Grade: <strong className="text-orange-400 font-bold">{invoice.fuel_type}</strong></div>
              <div>Status: <span className="text-emerald-400 font-semibold">100% Calibrated Dispensed</span></div>
            </div>
          </div>

          {/* Itemized Fuel & Zero Markup Bill Table */}
          <div className="rounded-2xl border border-white/10 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Volume (L)</th>
                  <th className="p-3 text-right">Official Rate</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                <tr>
                  <td className="p-3">
                    <div className="font-bold text-slate-100">{invoice.fuel_type} Doorstep Delivery</div>
                    <div className="text-[10px] text-slate-400">Government published market rate</div>
                  </td>
                  <td className="p-3 text-center font-mono font-bold">{quantity.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono">₹{rate.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono font-bold">₹{subtotal.toFixed(2)}</td>
                </tr>

                <tr>
                  <td className="p-3" colSpan={3}>
                    <div className="font-medium text-slate-300">Flat Doorstep Safety Delivery Fee</div>
                    <div className="text-[10px] text-slate-400">PESO-compliant mobile refueller transport</div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold">₹{deliveryFee.toFixed(2)}</td>
                </tr>

                <tr className="bg-emerald-500/5">
                  <td className="p-3" colSpan={3}>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <ShieldCheck className="w-4 h-4" /> Platform Surge Markup Guarantee
                    </div>
                    <div className="text-[10px] text-slate-400">Zero hidden fees, zero commission on fuel</div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">₹{platformMarkup.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Calculation */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Fuel Subtotal:</span>
                <span className="font-mono text-slate-200">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Fee:</span>
                <span className="font-mono text-slate-200">₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Platform Markup:</span>
                <span className="font-mono">₹0.00</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10 font-display">
                <span>Total Paid:</span>
                <span className="text-orange-400 font-mono">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* PESO Density Certificate & Digital Signature Seal */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between gap-4 text-[11px]">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  PESO Compliance Support & Density Certificate Verified
                </div>
                <div className="text-slate-400 mt-0.5 font-mono text-[10px]">
                  {invoice.density_certificate_ref || 'PESO-CERT-PETROL-2026-8831 (Density: 742.8 kg/m³ @ 15°C)'}
                </div>
                <div className="text-slate-500 text-[10px] mt-0.5">
                  Calibrated flow sensor accuracy: ±0.01% • Automated digital dispensing log
                </div>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-center justify-center p-2 rounded-xl bg-white text-slate-900 text-center font-mono text-[9px] font-bold">
              <QrCode className="w-8 h-8 text-slate-950 mb-0.5" />
              <span>SCAN TO VERIFY</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
