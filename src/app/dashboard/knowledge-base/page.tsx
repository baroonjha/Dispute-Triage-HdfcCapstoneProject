'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function KnowledgeBasePage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/rag-ingest', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({
                    type: 'success',
                    message: `Successfully ingested ${data.chunksProcessed} chunks from ${file.name}`,
                });
                setFile(null);
            } else {
                setStatus({
                    type: 'error',
                    message: data.error || 'Failed to upload file',
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setStatus({
                type: 'error',
                message: 'An unexpected error occurred',
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Knowledge Base</h1>
                <p className="mt-2 text-slate-500">
                    Upload policy documents (PDF or TXT) to train the AI Assistant.
                </p>
            </div>

            <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5">
                <form onSubmit={handleUpload} className="space-y-6">
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-10 transition-colors hover:bg-slate-50">
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <Upload className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="mt-4 flex text-sm leading-6 text-slate-600">
                                <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                                >
                                    <span>Upload a file</span>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        accept=".pdf,.txt"
                                        className="sr-only"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs leading-5 text-slate-500">PDF or TXT up to 10MB</p>
                        </div>
                    </div>

                    {file && (
                        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                            <FileText className="h-5 w-5 text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">{file.name}</span>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="ml-auto text-sm text-red-600 hover:text-red-700"
                                disabled={uploading}
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    {status && (
                        <div
                            className={`flex items-center gap-2 rounded-lg p-4 ${status.type === 'success'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                                }`}
                        >
                            {status.type === 'success' ? (
                                <CheckCircle className="h-5 w-5" />
                            ) : (
                                <AlertCircle className="h-5 w-5" />
                            )}
                            <p className="text-sm font-medium">{status.message}</p>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!file || uploading}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {uploading ? 'Ingesting...' : 'Ingest Document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
