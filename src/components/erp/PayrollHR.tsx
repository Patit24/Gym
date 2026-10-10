import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Employee } from '../../types/gym';
import { Users, DollarSign, FileText, CheckCircle2, ShieldCheck, Download, X, Activity, Award } from 'lucide-react';
import { TrainerActivityAudit } from './TrainerActivityAudit';

export const PayrollHR: React.FC = () => {
  const { employees, selectedBranchId } = useGym();
  const [activeSubTab, setActiveSubTab] = useState<'payroll' | 'trainer-audit'>('payroll');
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<Employee | null>(null);

  const branchEmployees = employees.filter((e) => e.branchId === selectedBranchId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Sub-navigation switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-[#14171F] border border-gym-border rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'payroll'
              ? 'bg-[#4F7CFF] text-white shadow-lg shadow-[#4F7CFF]/20'
              : 'text-gym-subtext hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Staff Payroll & Payslips</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trainer-audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'trainer-audit'
              ? 'bg-[#27D980] text-black shadow-lg shadow-[#27D980]/20'
              : 'text-gym-subtext hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Trainer Activity & Performance Audit</span>
        </button>
      </div>

      {activeSubTab === 'trainer-audit' ? (
        <TrainerActivityAudit />
      ) : (
        <>
          {/* Payslip Modal */}
      {selectedPayslipEmp && (
        <div 
          onClick={() => setSelectedPayslipEmp(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#14171F] border border-gym-border rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-200 my-auto max-h-[90vh] overflow-y-auto overscroll-contain"
          >
            <div className="flex items-center justify-between border-b border-gym-border pb-3 shrink-0">
              <h3 className="font-extrabold text-white text-base">MONTHLY PAYSLIP - AUGUST 2026</h3>
              <button 
                onClick={() => setSelectedPayslipEmp(null)} 
                className="p-1.5 rounded-lg bg-[#1E2330] text-slate-300 hover:text-white cursor-pointer"
              >
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
        </>
      )}

    </div>
  );
};
