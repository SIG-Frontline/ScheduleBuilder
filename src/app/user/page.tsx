"use client";
// pages/_app.tsx  (or wherever you need it)
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';
import { useState } from 'react';

function MyComponent() {
    const [apiResponse, setApiResponse] = useState<string | null>(null);
    const [AT, setAT] = useState<string | null>(null);

    async function callProtectedApi() {
        const token  = await getAccessToken();
        setAT(token);
        try {
            console.log(token);

            const res = await fetch('http://localhost:4000/test/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch data');
            }

            const data = await res.json();
            console.log(data);
            setApiResponse(JSON.stringify(data, null, 2));
        } catch (error) {
            setApiResponse(`Error: ${error.message}`);
        }
    }

    return (
        <div>
            <button onClick={callProtectedApi}>Call Protected API</button>
            {apiResponse && (
                <pre>
                    <code>{AT}</code>
                    <br/>
                    <code>{apiResponse}</code>
                </pre>
            )}
        </div>
    );
}

export default MyComponent;