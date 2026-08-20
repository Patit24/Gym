import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Employee } from '../../types/gym';
import { Users, DollarSign, FileText, CheckCircle2, ShieldCheck, Download, X } from 'lucide-react';

export const PayrollHR: React.FC = () => {
  const { employees, selectedBranchId } = useGym();
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<Employee | null>(null);

  const branchEmployees = employees.filter((e) => e.branchId === selectedBranchId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Payslip Modal */}
      {selectedPayslipEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#14171F] border border-gym-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-gym-border pb-3">
              <h3 className="font-extrabold text-white text-base">MONTHLY PAYSLIP - AUGUST 2026</h3>
              <button onClick={() => setSelectedPayslipEmp(null)} className="p-1.5 rounded-lg bg-[#1E2330] text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#0B0D12] rounded-2xl p-5 border border-gym-border/60 text-xs space-y-3 font-mono">
              <div className="flex justify-between">
                <div>
                  <strong className="text-white text-sm">{selectedPayslipEmp.name}</strong>
                  <p className="text-gym-subtext">{selectedPayslipEmp.role} (ID: {selectedPayslipEmp.id})</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#27D980] bg-[#27D980]/15 px-2 py-0.5 rounded border border-[#27D980]/30">
                    STATUS: DISBURSED
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-gym-border/40 py-3 space-y-2">
                <div className="flex justify-between">
                  <span>Base Salary:</span>
                  <strong className="text-white">₹{selectedPayslipEmp.baseSalary.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>PT Commission ({selectedPayslipEmp.ptSessionsCompleted} sessions @ {selectedPayslipEmp.ptCommissionRate}%):</span>
                  <strong>+ ₹{((selectedPayslipEmp.baseSalary * selectedPayslipEmp.ptCommissionRate) / 100).toFixed(0)}</strong>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>PF & ESI Deductions (12%):</span>
                  <strong>- ₹{(selectedPayslipEmp.baseSalary * 0.12).toFixed(0)}</strong>
                </div>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-white pt-1">
                <span>NET SALARY PAID:</span>
                <span className="text-[#27D980]">
                  ₹{(
                    selectedPayslipEmp.baseSalary +
                    (selectedPayslipEmp.baseSalary * selectedPayslipEmp.ptCommissionRate) / 100 -
                    selectedPayslipEmp.baseSalary * 0.12
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-blue-600 text-white font-extrabold text-xs shadow-lg shadow-[#4F7CFF]/20 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Payslip</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#27D980]" />
            Employee HR & Automated Payroll ({branchEmployees.length} Staff)
          </h2>
          <p className="text-xs text-gym-subtext">Base salary calculations, PT commission bonuses, PF/ESI deductions, and instant payslips</p>
        </div>
      </div>

      {/* Employee List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {branchEmployees.map((emp) => {
          const ptBonus = (emp.baseSalary * emp.ptCommissionRate) / 100;
          const deductions = emp.baseSalary * 0.12;
          const netSalary = emp.baseSalary + ptBonus - deductions;

          return (
            <div
              key={emp.id}
              className="glass-card rounded-3xl p-6 border border-gym-border hover:border-[#4F7CFF]/40 transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gym-subtext uppercase tracking-wider bg-[#0B0D12] px-2.5 py-1 rounded-lg border border-gym-border">
                    {emp.role}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1.5">{emp.name}</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#27D980]/15 flex items-center justify-center text-[#27D980]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2 bg-[#0B0D12]/50 p-3 rounded-2xl border border-gym-border/40 text-xs">
                <div className="flex justify-between text-gym-subtext">
                  <span>Shift:</span>
                  <strong className="text-slate-200">{emp.shift}</strong>
                </div>
                <div className="flex justify-between text-gym-subtext">
                  <span>Attendance:</span>
                  <strong className="text-slate-200">{emp.attendanceDays} Days</strong>
                </div>
                <div className="flex justify-between text-gym-subtext">
                  <span>PT Sessions Done:</span>
                  <strong className="text-emerald-400">{emp.ptSessionsCompleted} Sessions</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-gym-border/40 space-y-1 text-xs">
                <div className="flex justify-between text-gym-subtext">
                  <span>Base Salary:</span>
                  <span className="text-slate-200">₹{emp.baseSalary.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gym-subtext">
                  <span>Net Salary Payable:</span>
                  <span className="font-extrabold text-[#27D980]">₹{netSalary.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPayslipEmp(emp)}
                className="w-full py-2.5 rounded-xl bg-[#1E2330] hover:bg-[#272E40] border border-gym-border text-xs font-semibold text-[#4F7CFF] flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>View & Print Payslip</span>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
