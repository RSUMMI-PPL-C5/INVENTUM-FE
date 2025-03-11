'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaEdit, FaArrowLeft, FaTrash } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

// Tipe User berdasarkan schema Prisma
type User = {
  id: string;
  email: string;
  username: string;
  role: string | null;
  fullname: string | null;
  nokar: string;
  divisiId: number | null;
  divisiName?: string;
  waNumber: string | null;
  createdOn: string | null;
  modifiedOn: string;
};


export default function UserDetails() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      setLoading(true);
      
      try {
        const response = await fetch(`http://localhost:8000/user/${userId}`);
        
        if (!response.ok) {
          throw new Error('User tidak ditemukan');
        }
        
        const userData = await response.json();
        
        // Periksa apakah divisi ada sebelum mengakses propertinya
        // dan gunakan optional chaining untuk menghindari error
        const user: User = {
          ...userData,
          divisiName: userData?.divisi?.name || 'Tidak ada divisi'
        };
        
        setUser(user);
      } catch (err) {
        // Hapus console.error dan hanya set state error
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleGoBack = () => {
    router.push('/dashboard/user');
  };

  const handleEdit = () => {
    router.push(`/dashboard/user/edit/${userId}`);
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/user/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus pengguna');
      }

      router.push('/dashboard/user');
    } catch {
      alert('Gagal menghapus pengguna');
    }
  };

  // Loading state
  if (loading) {
    return <div className="p-6 text-center" data-testid="loading-state">Loading user details...</div>;
  }

  // Error state
  if (error || !user) {
    return (
      <div className="p-6" data-testid="error-state">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error ?? 'User tidak ditemukan'}</p>
          <Button onClick={handleGoBack} className="mt-4">
            <FaArrowLeft className="mr-2" /> Kembali
          </Button>
        </div>
        <Button onClick={handleGoBack} className="mt-4" data-testid="back-button">
          <FaArrowLeft className="mr-2" /> Kembali
        </Button>
      </div>
    );
  }

  // Success state with user details
  return (
    <div className="p-6" data-testid="user-detail">
      {/* Back button */}
      <Button variant="outline" onClick={handleGoBack} className="mb-6" data-testid="back-button">
        <FaArrowLeft className="mr-2" /> Kembali
      </Button>
      
      {/* Simple layout with basic user info */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6" data-testid="user-name">{user.fullname || user.username}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Email</h2>
            <p data-testid="user-email">{user.email}</p>
          </div>
          
          <div>
            <h2 className="text-sm font-medium text-gray-500">Username</h2>
            <p data-testid="user-username">{user.username}</p>
          </div>
          
          <div>
            <h2 className="text-sm font-medium text-gray-500">Role</h2>
            <p data-testid="user-role">{user.role || 'Tidak ada'}</p>
          </div>
          
          <div>
            <h2 className="text-sm font-medium text-gray-500">No. Kartu</h2>
            <p data-testid="user-nokar">{user.nokar}</p>
          </div>
          
          <div>
            <h2 className="text-sm font-medium text-gray-500">Divisi</h2>
            <p data-testid="user-divisi">{user.divisiName}</p>
          </div>
          
          <div>
            <h2 className="text-sm font-medium text-gray-500">WhatsApp</h2>
            <p data-testid="user-wa">{user.waNumber || 'Tidak ada'}</p>
          </div>
          
          <div>
            <h2 className="text-sm font-medium text-gray-500">Dibuat Pada</h2>
            <p data-testid="user-created">{user.createdOn || 'Tidak ada'}</p>
          </div>
          
          <div>
            <h2 className="text-sm font-medium text-gray-500">Dimodifikasi Pada</h2>
            <p data-testid="user-modified">{user.modifiedOn}</p>
          </div>
        </div>
        
        <div className="mt-8 flex space-x-4">
          <Button onClick={handleEdit} data-testid="edit-button">
            <FaEdit className="mr-2" /> Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} data-testid="delete-button">
            <FaTrash className="mr-2" /> Hapus
          </Button>
        </div>

      </div>
    </div>
  );
}