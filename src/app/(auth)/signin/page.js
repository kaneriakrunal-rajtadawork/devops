'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {loginStart, loginSuccess, loginFailure} from '@/store/authSlice';
import { CircularProgress } from '@mui/material';
import { showError } from '@/utils/toast';

export default function SigninPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        dispatch(loginStart());
        try {
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if(!data?.success) {
                setError(data.message || 'Something went wrong');
            } else {
                dispatch(loginSuccess({ user: data?.data?.user, token: data?.data?.token }));
                router.push('/');
                setError(null);
            }

        } catch (err) {
            console.log(err,'Error')
           dispatch(loginFailure(err.message));
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Sign In</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full py-2 cursor-pointer text-white bg-blue-600 rounded-md hover:bg-blue-700 ">
                        {loading ? <CircularProgress color='white' size={"20px"}/> : 'Sign In'}
                    </button>
                </form>
                <p className="text-sm text-center">
                    Not have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
} 