import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Mempersiapkan Sistem Ujian...',
}) => {
  return (
    <div className="text-center py-24 px-4 max-w-lg mx-auto animate-fade-in">
      <div className="w-14 h-14 border-[5px] border-slate-200 border-t-[#0056b3] rounded-full animate-spin mx-auto mb-6 shadow-sm" />
      <p className="text-[#0056b3] font-bold text-lg sm:text-xl tracking-tight">
        {message}
      </p>
      <p className="text-slate-500 text-xs sm:text-sm mt-2">
        Memverifikasi koneksi aman ke server PT Multi Indomandiri...
      </p>
    </div>
  );
};
