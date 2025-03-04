'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit, FaTrash, FaFilter, FaTimes } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

// Definisikan tipe user dengan ID
type User = {
  id: number; // Tambah id untuk routing
  email: string;
  name: string;
  department: string;
  date: string;
  phone?: string;
  address?: string;
  position?: string;
  projects?: string[];
}

const users: User[] = [
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

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();


  // Fungsi untuk menutup modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // Fungsi untuk navigasi ke halaman detail
  const navigateToUserDetail = (userId: number) => {
    router.push(`/dashboard/user/${userId}`);
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="bg-blue-900 text-white p-6 rounded-lg flex items-center gap-6">
        <div className="w-40 h-40 bg-gray-300"></div>
        <div>
          <h1 className="text-2xl font-bold">Pengguna</h1>
          <p>Lorem Ipsum is simply dummy text of the printing industry.</p>
          <Button className="mt-4">+ Tambah Pengguna</Button>
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
        />
        <Button>
          <FaFilter /> Filter
        </Button>
      </div>
      
      {/* Users Table */}
      <div className="mt-6 border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Email</th>
              <th>Nama</th>
              <th>Departemen</th>
              <th>Tanggal Masuk</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr 
                key={user.id} 
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => navigateToUserDetail(user.id)}
              >
                <td className="p-4">{user.email}</td>
                <td>{user.name}</td>
                <td>{user.department}</td>
                <td>{user.date}</td>
                <td onClick={(e) => e.stopPropagation()} className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation(); // Mencegah event bubbling
                      navigateToUserDetail(user.id);
                    }}
                  >
                    <FaEdit />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation(); // Mencegah event bubbling
                      console.log('Delete user:', user.name);
                    }}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <Button variant="outline">&lt; Previous</Button>
        <Button variant="outline">1</Button>
        <Button variant="outline">2</Button>
        <Button variant="outline">3</Button>
        <span>...</span>
        <Button variant="outline">Next &gt;</Button>
      </div>

      {/* Modal for user details */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">Detail Pengguna</h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <FaTimes />
              </Button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="w-40 h-40 bg-gray-300 mx-auto rounded-full mb-4"></div>
                  <h3 className="text-xl font-bold text-center">{selectedUser.name}</h3>
                  <p className="text-center text-gray-500">{selectedUser.department}</p>
                  <p className="text-center text-gray-500">{selectedUser.position}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-500">Email</h4>
                    <p>{selectedUser.email}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-500">Telepon</h4>
                    <p>{selectedUser.phone || 'Tidak tersedia'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-500">Alamat</h4>
                    <p>{selectedUser.address || 'Tidak tersedia'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-500">Tanggal Masuk</h4>
                    <p>{selectedUser.date}</p>
                  </div>
                </div>
              </div>

              {selectedUser.projects && selectedUser.projects.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-medium text-gray-500 mb-2">Proyek</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.projects.map((project, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {project}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end space-x-2">
                <Button variant="outline" onClick={closeModal}>
                  Tutup
                </Button>
                <Button onClick={() => navigateToUserDetail(selectedUser.id)}>
                  <FaEdit className="mr-2" /> Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}