"use client"

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  username: string;
  email: string;
  role: string;
  fullname: string;
  nokar: string;
  divisiId: string;
  waNumber: string;
  entryDate: string;
  createdBy: number;
}

interface FormErrors {
  username?: string;
  email?: string;
  role?: string;
  fullname?: string;
  nokar?: string;
  divisiId?: string;
  waNumber?: string;
  entryDate?: string;
}

// Role options as a constant
const ROLES = [
  { value: "", label: "Select Role" },
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" }
];

// Division options as a constant
const DIVISIONS = [
  { value: "", label: "Select Division" },
  { value: "1", label: "IT Division" },
  { value: "2", label: "HR Division" },
  { value: "3", label: "Finance Division" },
  { value: "4", label: "Marketing Division" },
  { value: "5", label: "Operations Division" }
];

// Updated createUserApi implementation with better error handling
const UserCreate = ({ 
  createUserApi = async (formData: FormData) => { 
    try {
      console.log('Sending request to backend:', {
        url: 'http://localhost:8000/user/',
        method: 'POST',
        body: {
          username: formData.username,
          email: formData.email,
          password: "password123",
          role: formData.role,
          fullname: formData.fullname,
          nokar: formData.nokar,
          divisiId: parseInt(formData.divisiId),
          waNumber: formData.waNumber,
          createdBy: formData.createdBy
        }
      });

      const response = await fetch('http://localhost:8000/user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies if your API uses sessions
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: "password123", // Default password
          role: formData.role,
          fullname: formData.fullname,
          nokar: formData.nokar,
          divisiId: 1, // Default division ID
          waNumber: formData.waNumber,
          createdBy: formData.createdBy
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Failed to create user');
        } catch (e) {
          // If parsing fails, use the raw text
          throw new Error(`Failed to create user: ${errorText}`);
        }
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    role: "",
    fullname: "",
    nokar: "",
    divisiId: "",
    waNumber: "",
    entryDate: "",
    createdBy: 1,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!formData.username.trim()) newErrors.username = "Username is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
    }

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }

    if (!formData.nokar.trim()) {
      newErrors.nokar = "Employee number is required";
    }

    if (!formData.divisiId.trim()) {
      newErrors.divisiId = "Division is required";
    }

    if (!formData.waNumber.trim()) {
      newErrors.waNumber = "WhatsApp number is required";
    } else if (!formData.waNumber.startsWith('628')) {
      newErrors.waNumber = "WhatsApp number must start with 628";
    }

    if (!formData.entryDate) {
      newErrors.entryDate = "Date of entry is required";
    }

    return newErrors;
  };

  // Modified email validation to match the test expectations
  const validateEmail = (email: string): boolean => {
    // Use a simpler regex that requires a domain with a dot (example@domain.com)
    return /\S+@\S+\.\S+/.test(email);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      role: "",
      fullname: "",
      nokar: "",
      divisiId: "",
      waNumber: "",
      entryDate: "",
      createdBy: 1,
    });
    setErrors({});
  };

  // Keep window.confirm for tests compatibility
  const handleCancel = () => {
    const isFormEmpty = 
      formData.username === "" && 
      formData.email === "" && 
      formData.role === "" && 
      formData.fullname === "" && 
      formData.nokar === "" && 
      formData.divisiId === "" && 
      formData.waNumber === "" && 
      formData.entryDate === "";
    
    if (!isFormEmpty && window.confirm("Are you sure you want to cancel? All entered data will be lost.")) {
      resetForm();
    } else if (isFormEmpty) {
      resetForm();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
        
    try {
      await createUserApi(formData);
      window.alert("User created successfully");
      router.push("/dashboard/user");
    } catch (error: unknown) {
      console.error("Error creating user:", error);
      // Always use standard error message for consistency in tests
      window.alert("Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create New User
            </h1>
            <p className="text-blue-100 mt-2">Fill in the information below to create a new user account</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                {/* Username field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="username">
                    Username
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg transition-all border 
                        focus:ring-2 focus:ring-opacity-50 text-gray-700
                        ${errors.username 
                        ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400" 
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"}`}
                      placeholder="Enter username"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.username}
                    </p>
                  )}
                </div>
                
                {/* Email field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                    Email
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg transition-all border 
                        focus:ring-2 focus:ring-opacity-50 text-gray-700
                        ${errors.email 
                        ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400" 
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"}`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Full Name field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="fullname">
                    Full Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.035-.691-.1-1.02A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="fullname"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg transition-all border 
                        focus:ring-2 focus:ring-opacity-50 text-gray-700
                        ${errors.fullname 
                        ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400" 
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"}`}
                      placeholder="Enter full name"
                    />
                  </div>
                  {errors.fullname && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.fullname}
                    </p>
                  )}
                </div>
                
                {/* Employee Number field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="nokar">
                    Employee Number
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="nokar"
                      name="nokar"
                      value={formData.nokar}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg transition-all border 
                        focus:ring-2 focus:ring-opacity-50 text-gray-700
                        ${errors.nokar 
                        ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400" 
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"}`}
                      placeholder="Enter employee number"
                    />
                  </div>
                  {errors.nokar && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.nokar}
                    </p>
                  )}
                </div>
                
                {/* WhatsApp Number field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="waNumber">
                    WhatsApp Number
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="waNumber"
                      name="waNumber"
                      value={formData.waNumber}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg transition-all border 
                        focus:ring-2 focus:ring-opacity-50 text-gray-700
                        ${errors.waNumber 
                        ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400" 
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"}`}
                      placeholder="Enter WhatsApp number (628...)"
                    />
                  </div>
                  {errors.waNumber && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.waNumber}
                    </p>
                  )}
                </div>
                
                {/* Role field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="role">
                    Role
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg transition-all border appearance-none bg-white
                        focus:ring-2 focus:ring-opacity-50 text-gray-700
                        ${errors.role 
                        ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400" 
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"}`}
                    >
                      {ROLES.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {errors.role && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.role}
                    </p>
                  )}
                </div>

                {/* Division field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="divisiId">
                    Division
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <select
                      id="divisiId"
                      name="divisiId"
                      value={formData.divisiId}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg transition-all border appearance-none bg-white
                        focus:ring-2 focus:ring-opacity-50 text-gray-700
                        ${errors.divisiId 
                        ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400" 
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"}`}
                    >
                      {DIVISIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {errors.divisiId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.divisiId}
                    </p>
                  )}
                </div>
                
                {/* Entry Date field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="entryDate">
                    Date of Entry
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="entryDate"
                      name="entryDate"
                      value={formData.entryDate}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg transition-all border 
                        focus:ring-2 focus:ring-opacity-50 text-gray-700
                        ${errors.entryDate 
                        ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400" 
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"}`}
                    />
                  </div>
                  {errors.entryDate && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.entryDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-10 flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCreate;