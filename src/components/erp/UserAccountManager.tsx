import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Role, AppUser } from '../../types/gym';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Filter, 
  KeyRound, 
  UserCheck, 
  UserX, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Lock, 
  Building2, 
  Sparkles,
  RefreshCw,
  Eye,
  UserPlus
} from 'lucide-react';

export const UserAccountManager: React.FC = () => {
  const { 
    appUsers, 
    branches, 
    currentRole, 
    appUserAccount, 
    updateUserStatus, 
    forceUserPasswordChange, 
    updateUserRoleAndBranch, 
    deleteUserAccount,
    addAppUser
  } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AppUser | null>(null);
  const [editRole, setEditRole] = useState<Role>('Trainer');
  const [editBranchId, setEditBranchId] = useState<string>('all');

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('Trainer');
  const [newBranchId, setNewBranchId] = useState<string>(branches[0]?.id || 'all');
  const [newTempPass, setNewTempPass] = useState('Gym@' + Math.floor(1000 + Math.random() * 9000));

  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const isMasterAdmin = currentRole === 'Super Admin' || appUserAccount?.username === 'MASTERADMIN';

  const totalUsers = appUsers.length;
  const activeUsersCount = appUsers.filter(u => u.isActive !== false).length;
  const suspendedUsersCount = appUsers.filter(u => u.isActive === false).length;
  const forcedPasswordChangeCount = appUsers.filter(u => u.mustChangePassword).length;

  const filteredUsers = appUsers.filter(user => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      user.username.toLowerCase().includes(q) || 
      user.linkedName.toLowerCase().includes(q) || 
      (user.email && user.email.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesBranch = branchFilter === 'ALL' || user.branchId === branchFilter;
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && user.isActive !== false) ||
      (statusFilter === 'SUSPENDED' && user.isActive === false) ||
      (statusFilter === 'MUST_CHANGE' && user.mustChangePassword);

    return matchesSearch && matchesRole && matchesBranch && matchesStatus;
  });

  const handleToggleStatus = async (user: AppUser) => {
    setActionError('');
    setActionSuccess('');
    try {
      if (user.username === 'MASTERADMIN' || user.isProtected) {
        setActionError('Master Admin account is protected and cannot be deactivated.');
        return;
      }
      const newStatus = !user.isActive;
      await updateUserStatus(user.id, newStatus);
      setActionSuccess(`Account ${user.username} is now ${newStatus ? 'Active' : 'Suspended'}.`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update account status.');
    }
  };

  const handleForcePasswordChange = async (user: AppUser) => {
    setActionError('');
    setActionSuccess('');
    try {
      await forceUserPasswordChange(user.id);
      setActionSuccess(`Password change will be required on next login for ${user.username}.`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to force password change.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    setActionError('');
    setActionSuccess('');

    try {
      await updateUserRoleAndBranch(selectedUserForEdit.id, editRole, editBranchId);
      setActionSuccess(`Updated ${selectedUserForEdit.username} to ${editRole} for branch ${editBranchId}.`);
      setSelectedUserForEdit(null);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update account details.');
    }
  };

  const handleDeleteUser = async (user: AppUser) => {
    if (user.username === 'MASTERADMIN' || user.isProtected) {
      setActionError('Master Admin account cannot be deleted.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete account ${user.username}?`)) {
      return;
    }

    setActionError('');
    setActionSuccess('');
    try {
      await deleteUserAccount(user.id);
      setActionSuccess(`Account ${user.username} deleted.`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete account.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim()) {
      setActionError('Please provide username and full name.');
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      const generatedId = `USR-${Date.now()}`;
      const newUserRecord: AppUser = {
        id: generatedId,
        username: newUsername.trim().toUpperCase(),
        email: newEmail.trim() || `${newUsername.trim().toLowerCase()}@smartgym.internal`,
        role: newRole,
        linkedId: generatedId,
        linkedName: newFullName.trim(),
        branchId: newBranchId,
        createdAt: new Date().toISOString(),
        createdByAdminId: appUserAccount?.id || 'system',
        isActive: true,
        mustChangePassword: true,
        tempPassword: newTempPass,
        permissions: {
          canViewDashboard: true,
          canEditWorkouts: newRole === 'Super Admin' || newRole === 'Owner' || newRole === 'Trainer',
          canEditDiets: newRole === 'Super Admin' || newRole === 'Owner' || newRole === 'Dietitian',
          canViewMembers: newRole !== 'Member',
          canManageFinance: newRole === 'Super Admin' || newRole === 'Owner',
          canAccessAdmin: newRole === 'Super Admin' || newRole === 'Owner' || newRole === 'Branch Manager',
        }
      };

      await addAppUser(newUserRecord);
      setActionSuccess(`Account ${newUserRecord.username} created successfully with temporary password.`);
      setShowAddUserModal(false);
      setNewUsername('');
      setNewFullName('');
      setNewEmail('');
      setNewTempPass('Gym@' + Math.floor(1000 + Math.random() * 9000));
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to create user account.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER BANNER */}
      <div className="relative rounded-3xl p-6 lg:p-7 bg-gradient-to-r from-[#14171F] via-[#1A202E] to-[#14171F] border border-gym-border overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F7CFF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Security & RBAC Authority
              </span>
              <span className="text-xs text-gym-subtext">• Production Directory</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              User & Account Management
            </h1>
            <p className="text-xs text-gym-subtext max-w-xl">
              Central authority for staff, trainer, and member login accounts, role permissions, branch assignments, and security status.
            </p>
          </div>

          {isMasterAdmin && (
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D68E6] text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#4F7CFF]/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Provision Staff / Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* FEEDBACK ALERTS */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-200 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#27D980] shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-xs text-red-200 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* METRICS SUMMARY TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="p-4 bg-[#14171F] border border-gym-border rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gym-subtext uppercase tracking-wider">Total Accounts</div>
          <div className="text-2xl font-black text-white">{totalUsers}</div>
          <div className="text-[10px] text-gym-subtext">Registered in database</div>
        </div>
        <div className="p-4 bg-[#14171F] border border-gym-border rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-[#27D980] uppercase tracking-wider">Active Users</div>
          <div className="text-2xl font-black text-[#27D980]">{activeUsersCount}</div>
          <div className="text-[10px] text-gym-subtext">Full system access</div>
        </div>
        <div className="p-4 bg-[#14171F] border border-gym-border rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Suspended</div>
          <div className="text-2xl font-black text-red-400">{suspendedUsersCount}</div>
          <div className="text-[10px] text-gym-subtext">Access restricted</div>
        </div>
        <div className="p-4 bg-[#14171F] border border-gym-border rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pending Password Reset</div>
          <div className="text-2xl font-black text-amber-400">{forcedPasswordChangeCount}</div>
          <div className="text-[10px] text-gym-subtext">Force change on login</div>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="p-4 bg-[#14171F] border border-gym-border rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gym-subtext" />
            <input
              type="text"
              placeholder="Search by name, username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0E1118] border border-gym-border rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-white placeholder-gym-subtext outline-none focus:border-[#4F7CFF]"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-[#0E1118] border border-gym-border rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#4F7CFF]"
            >
              <option value="ALL">All Roles ({totalUsers})</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Owner">Owner</option>
              <option value="Branch Manager">Branch Manager</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Trainer">Trainer</option>
              <option value="Dietitian">Dietitian</option>
              <option value="Member">Member</option>
            </select>
          </div>

          <div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full bg-[#0E1118] border border-gym-border rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#4F7CFF]"
            >
              <option value="ALL">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#0E1118] border border-gym-border rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#4F7CFF]"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="SUSPENDED">Suspended Only</option>
              <option value="MUST_CHANGE">Requires Password Change</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACCOUNTS DIRECTORY TABLE */}
      <div className="bg-[#14171F] border border-gym-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E1118] text-gym-subtext uppercase tracking-wider font-bold border-b border-gym-border">
              <tr>
                <th className="px-4 py-3">User & Display Name</th>
                <th className="px-4 py-3">Username / ID</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Assigned Branch</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gym-subtext">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-gym-subtext/40" />
                      <p className="font-semibold">No accounts found matching search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isProtected = user.username === 'MASTERADMIN' || user.isProtected;
                  const branchObj = branches.find(b => b.id === user.branchId);
                  const branchDisplay = user.branchId === 'all' ? 'All Franchise Branches' : (branchObj ? `${branchObj.name} (${branchObj.code})` : user.branchId);

                  const roleColors: Record<string, string> = {
                    'Super Admin': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
                    'Owner': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                    'Branch Manager': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
                    'Receptionist': 'bg-pink-500/15 text-pink-300 border-pink-500/30',
                    'Trainer': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    'Dietitian': 'bg-teal-500/15 text-teal-300 border-teal-500/30',
                    'Member': 'bg-slate-500/15 text-slate-300 border-slate-500/30',
                  };

                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1C2230] border border-gym-border flex items-center justify-center font-bold text-white text-xs">
                            {user.linkedName ? user.linkedName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{user.linkedName || 'Unnamed Account'}</span>
                              {isProtected && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                  🛡️ Protected
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gym-subtext">{user.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-cyan-300 text-[11px]">
                        {user.username}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${roleColors[user.role] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'}`}>
                          {user.role}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-gym-subtext font-medium text-[11px]">
                        {branchDisplay}
                      </td>

                      <td className="px-4 py-3.5">
                        {user.isActive === false ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-300 border border-red-500/30">
                            Suspended
                          </span>
                        ) : user.mustChangePassword ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Must Change Pwd
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-gym-subtext text-[11px]">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Edit Role & Branch"
                            onClick={() => {
                              setSelectedUserForEdit(user);
                              setEditRole(user.role);
                              setEditBranchId(user.branchId || 'all');
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-gym-border transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Force Password Change on Next Login"
                            onClick={() => handleForcePasswordChange(user)}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {!isProtected && (
                            <button
                              title={user.isActive === false ? 'Activate Account' : 'Suspend Account'}
                              onClick={() => handleToggleStatus(user)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                user.isActive === false
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-[#27D980] border-emerald-500/30'
                                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30'
                              }`}
                            >
                              {user.isActive === false ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {!isProtected && isMasterAdmin && (
                            <button
                              title="Delete Account"
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: EDIT ROLE & BRANCH */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171F] border border-gym-border rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white">Edit Account Role & Branch</h2>
              <p className="text-xs text-gym-subtext">
                User: <span className="text-cyan-300 font-bold">{selectedUserForEdit.username}</span> ({selectedUserForEdit.linkedName})
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gym-subtext uppercase">Permitted System Role</label>
                <select
                  value={editRole}
                  disabled={selectedUserForEdit.username === 'MASTERADMIN' || selectedUserForEdit.isProtected}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className="w-full bg-[#0E1118] border border-gym-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#4F7CFF]"
                >
                  <option value="Super Admin">Super Admin (Full System Access)</option>
                  <option value="Owner">Franchise Owner (Multi-Branch P&L)</option>
                  <option value="Branch Manager">Branch Manager (Branch Admin)</option>
                  <option value="Receptionist">Receptionist (Front Desk Operations)</option>
                  <option value="Trainer">Trainer / Coach (No Financials)</option>
                  <option value="Dietitian">Dietitian / Nutritionist (No Financials)</option>
                  <option value="Member">Member (Client Portal)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gym-subtext uppercase">Assigned Gym Branch</label>
                <select
                  value={editBranchId}
                  onChange={(e) => setEditBranchId(e.target.value)}
                  className="w-full bg-[#0E1118] border border-gym-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#4F7CFF]"
                >
                  <option value="all">All Branches (Franchise-Wide)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#3D68E6] text-xs font-extrabold text-white shadow-lg shadow-[#4F7CFF]/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PROVISION NEW STAFF / ADMIN ACCOUNT */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171F] border border-gym-border rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white">Provision New Staff / Admin Account</h2>
              <p className="text-xs text-gym-subtext">
                Creates an authorized enterprise account with initial credentials and forced password change.
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gym-subtext uppercase">Full Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram Verma"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full bg-[#0E1118] border border-gym-border rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#4F7CFF]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gym-subtext uppercase">Username</label>
                  <input
                    type="text"
                    placeholder="e.g. TRN00005, ADMIN_WEST"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-[#0E1118] border border-gym-border rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#4F7CFF]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gym-subtext uppercase">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. staff@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#0E1118] border border-gym-border rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gym-subtext uppercase">Assigned Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                    className="w-full bg-[#0E1118] border border-gym-border rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#4F7CFF]"
                  >
                    <option value="Trainer">Trainer (Coaching & Workout Studio)</option>
                    <option value="Dietitian">Dietitian (Nutrition Studio)</option>
                    <option value="Receptionist">Receptionist (Gate & Registration)</option>
                    <option value="Branch Manager">Branch Manager (Branch Operations)</option>
                    <option value="Owner">Owner (Multi-Branch P&L)</option>
                    <option value="Super Admin">Super Admin (Full System Control)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gym-subtext uppercase">Branch Location</label>
                  <select
                    value={newBranchId}
                    onChange={(e) => setNewBranchId(e.target.value)}
                    className="w-full bg-[#0E1118] border border-gym-border rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#4F7CFF]"
                  >
                    <option value="all">All Branches</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gym-subtext uppercase">Temporary Password</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTempPass}
                    onChange={(e) => setNewTempPass(e.target.value)}
                    className="w-full bg-[#0E1118] border border-gym-border rounded-xl px-3 py-2 font-mono text-xs font-bold text-amber-300 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setNewTempPass('Gym@' + Math.floor(1000 + Math.random() * 9000))}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gym-subtext hover:text-white border border-gym-border"
                    title="Generate New Temporary Password"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[10px] text-gym-subtext">User will be forced to change this password on first login.</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#3D68E6] text-xs font-extrabold text-white shadow-lg shadow-[#4F7CFF]/20 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
