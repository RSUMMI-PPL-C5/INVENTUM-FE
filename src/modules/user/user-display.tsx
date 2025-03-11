'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import UserFilterModal, { Filters } from '@/components/general/userfiltermodal';

// Tipe User berdasarkan schema Prisma
type User = {
  id: string;
  email: string;
  username: string;
  role: string | null;
  fullname: string | null;
  nokar: string;
  divisiId: number | null;
  waNumber: string | null;
  createdOn: string | null;
  modifiedOn: string;
  divisi?: {
    name: string;
  };
};

const divisionMapping: Record<string, number> = {
  "Divisi A": 1,
  "Divisi B": 2,
  "Divisi C": 3,
};

export const buildQueryParams = (filters: Filters): string => {
  const params = new URLSearchParams();

  filters.role.forEach(role => {
    params.append("role", role);
  });

  filters.division.forEach(div => {
    const id = divisionMapping[div];
    if (id) {
      params.append("divisiId", id.toString());
    }
  });

  if (filters.createdOnStart) {
    params.append("createdOnStart", format(filters.createdOnStart, "yyyy-MM-dd"));
  }
  if (filters.createdOnEnd) {
    params.append("createdOnEnd", format(filters.createdOnEnd, "yyyy-MM-dd"));
  }

  if (filters.modifiedOnStart) {
    params.append("modifiedOnStart", format(filters.modifiedOnStart, "yyyy-MM-dd"));
  }
  if (filters.modifiedOnEnd) {
    params.append("modifiedOnEnd", format(filters.modifiedOnEnd, "yyyy-MM-dd"));
  }

  return params.toString();
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    role: [],
    division: [],
    createdOnStart: null,
    createdOnEnd: null,
    modifiedOnStart: null,
    modifiedOnEnd: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch users data from backend with search query
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const queryParams = buildQueryParams(filters);
        let url = `http://localhost:8000/user`;

        if (queryParams || search) {
          const searchParam = search ? `search=${search}` : '';
          url += `?${[queryParams, searchParam].filter(Boolean).join('&')}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [search, filters]);

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.username && user.username.toLowerCase().includes(searchLower)) ||
      (user.fullname && user.fullname.toLowerCase().includes(searchLower)) ||
      (user.role && user.role.toLowerCase().includes(searchLower))
    );
  });
  // Fungsi untuk menutup modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };
  // Navigate to user detail page
  const navigateToUserDetail = (userId: string) => {
    router.push(`/dashboard/user/${userId}`);
  };

  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (_error) {
      console.error('Error formatting date:', _error);
      return dateString;
    }
  // Fungsi untuk navigasi ke halaman update pengguna
  const navigateToUserEdit = (userId: number) => {
    router.push(`/dashboard/user/${userId}/edit`);
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="bg-blue-900 text-white p-6 rounded-lg flex items-center gap-6">
        <div className="w-40 h-40 bg-gray-300"></div>
        <div>
          <h1 className="text-2xl font-bold">Pengguna</h1>
          <p>Kelola semua akun pengguna dalam sistem</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/user/create')}>
            + Tambah Pengguna
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 mt-6">
        <input
          type="text"
          placeholder="Cari pengguna"
          className="border p-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="search-input"
        />
        <Button onClick={() => setShowFilterModal(true)}>
          <FaFilter /> Filter
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center p-8">Loading users...</div>
      )}
      
      {error && (
        <div className="text-red-500 p-8 text-center">
          Error: {error}
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="mt-6 border rounded-lg overflow-hidden">
          <table className="w-full text-left" data-testid="users-table">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Email</th>
                <th>Nama</th>
                <th>Divisi</th>
                <th>Tanggal Pembuatan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigateToUserDetail(user.id)}
                    data-testid={`user-row-${user.id}`}
                  >
                    <td className="p-4">{user.email}</td>
                    <td>{user.fullname || user.username}</td>
                    <td>{user.divisi?.name || `-`}</td>
                    <td>{formatDate(user.createdOn)}</td>
                    <td onClick={(e) => e.stopPropagation()} className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToUserDetail(user.id);
                        }}
                        data-testid={`edit-button-${user.id}`}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this user?')) {
                            // Delete user logic will be here
                            console.log('Delete user:', user.id);
                          }
                        }}
                        data-testid={`delete-button-${user.id}`}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    {search ? "No users match your search" : "No users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <UserFilterModal
          isOpen={showFilterModal}
          filters={filters}
          onConfirm={(newFilters) => {
            setFilters(newFilters);
            setShowFilterModal(false);
          }}
          onCancel={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
}