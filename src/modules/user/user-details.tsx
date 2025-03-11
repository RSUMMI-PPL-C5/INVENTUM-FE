'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaEdit, FaArrowLeft, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

// Definisikan tipe user dengan ID
type User = {
  id: number;
  email: string;
  name: string;
  department: string;
  date: string;
  phone?: string;
  address?: string;
  position?: string;
  projects?: string[];
}

// Data dummy (nantinya akan diganti dengan data dari API)
const usersData: User[] = [
  { id: 1, email: 'azmy@gmail.com', name: 'Azmy Arya Rizaldi', department: 'Executive Director', date: '12 Feb 2025', 
    phone: '+62 812 3456 7890', address: 'Jl. Diponegoro No. 123, Jakarta', position: 'Senior Manager', 
    projects: ['Project Alpha', 'Project Beta'] },
  { id: 2, email: 'john@gmail.com', name: 'John Doe', department: 'Marketing', date: '15 Mar 2025',
    phone: '+62 812 3456 7891', address: 'Jl. Sudirman No. 456, Jakarta', position: 'Team Lead',
    projects: ['Project Gamma'] },
  { id: 3, email: 'jane@gmail.com', name: 'Jane Smith', department: 'Engineering', date: '20 Apr 2025',
    phone: '+62 812 3456 7892', address: 'Jl. Thamrin No. 789, Jakarta', position: 'Developer',
    projects: ['Project Delta', 'Project Epsilon', 'Project Zeta'] },
  { id: 4, email: 'mike@gmail.com', name: 'Mike Johnson', department: 'Design', date: '05 May 2025',
    phone: '+62 812 3456 7893', address: 'Jl. Gatot Subroto No. 101, Jakarta', position: 'UI/UX Designer',
    projects: ['Project Eta'] },
];

export default function UserDetails() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulasi fetching data dari API
    const fetchUser = () => {
      setLoading(true);
      
      try {
        // Cari user berdasarkan ID dari data dummy
        // Nanti bisa diganti dengan fetch API
        const foundUser = usersData.find(u => u.id === userId);
        
        if (foundUser) {
          setUser(foundUser);
        } else {
          setError('User tidak ditemukan');
        }
      } catch (err) {
        setError('Terjadi kesalahan saat mengambil data user');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error ?? 'User tidak ditemukan'}</p>
          <Button onClick={handleGoBack} className="mt-4">
            <FaArrowLeft className="mr-2" /> Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back button */}
      <Button variant="outline" onClick={handleGoBack} className="mb-6">
        <FaArrowLeft className="mr-2" /> Kembali
      </Button>
      
      {/* User profile header */}
      <div className="bg-blue-900 text-white p-8 rounded-t-lg">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-40 h-40 bg-gray-300 rounded-full"></div>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-xl text-blue-200 mt-1">{user.position ?? 'N/A'}</p>
            <p className="text-blue-200 mt-1">{user.department}</p>
            <Button className="mt-4">
              <FaEdit className="mr-2" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>
      
      {/* User details */}
      <div className="bg-white shadow-md rounded-b-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Informasi Kontak</h2>
            
            <div className="flex items-center">
              <FaEnvelope className="text-gray-500 mr-3" />
              <div>
                <h3 className="text-sm text-gray-500 font-medium">Email</h3>
                <p>{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FaPhone className="text-gray-500 mr-3" />
              <div>
                <h3 className="text-sm text-gray-500 font-medium">Telepon</h3>
                <p>{user.phone ?? 'Tidak tersedia'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-gray-500 mr-3" />
              <div>
                <h3 className="text-sm text-gray-500 font-medium">Alamat</h3>
                <p>{user.address ?? 'Tidak tersedia'}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Informasi Pekerjaan</h2>
            
            <div>
              <h3 className="text-sm text-gray-500 font-medium">Departemen</h3>
              <p>{user.department}</p>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-500 font-medium">Posisi</h3>
              <p>{user.position ?? 'Tidak tersedia'}</p>
            </div>
            
            <div className="flex items-center">
              <FaCalendarAlt className="text-gray-500 mr-3" />
              <div>
                <h3 className="text-sm text-gray-500 font-medium">Tanggal Masuk</h3>
                <p>{user.date}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Projects section */}
        {user.projects && user.projects.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Proyek</h2>
            <div className="flex flex-wrap gap-3">
              {user.projects.map((project) => (
                <span key={project} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                  {project}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}