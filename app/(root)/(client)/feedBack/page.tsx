'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Image as ImageIcon, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { decodeJWT } from '@/lib/utils';

interface Feedback {
    id: string;
    content: string;
    rating: number;
    image_id: string;
    order_detail_id: string;
    available_cake_id: string;
    bakery_id: string;
    created_at: string;
    updated_at: string;
}

const FeedbackPage = () => {
    const router = useRouter();
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    setError('Please login to view feedback');
                    setLoading(false);
                    return;
                }

                const decodedToken = decodeJWT(accessToken);
                if (!decodedToken?.id) {
                    setError('Invalid authentication');
                    setLoading(false);
                    return;
                }

                // Fetch existing feedback if any
                const response = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/cake_reviews', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.payload && data.payload.length > 0) {
                        setFeedback(data.payload[0]);
                        setRating(data.payload[0].rating);
                        setContent(data.payload[0].content);
                        if (data.payload[0].image_id) {
                            setPreviewUrl(data.payload[0].image_id);
                        }
                    }
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch feedback');
                setLoading(false);
            }
        };

        fetchFeedback();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                toast.error('Please login to submit feedback');
                return;
            }

            let imageId = feedback?.image_id;
            if (imageFile) {
                // Upload image first
                const formData = new FormData();
                formData.append('file', imageFile);

                const uploadResponse = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/files', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: formData
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload image');
                }

                const uploadData = await uploadResponse.json();
                imageId = uploadData.payload.id;
            }

            const response = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/cake_reviews', {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content,
                    rating,
                    image_id: imageId,
                    order_detail_id: feedback?.order_detail_id,
                    available_cake_id: feedback?.available_cake_id,
                    bakery_id: feedback?.bakery_id
                })
            });

            if (response.ok) {
                toast.success(isEditing ? 'Feedback updated successfully!' : 'Feedback submitted successfully!', {
                    description: 'Thank you for sharing your experience with us.',
                    duration: 3000,
                    position: 'top-center',
                    style: {
                        background: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '16px',
                        fontSize: '14px',
                    },
                });
                router.push('/orderHistory');
            } else {
                throw new Error('Failed to submit feedback');
            }
        } catch (err) {
            toast.error('Failed to submit feedback', {
                description: 'Please try again later.',
                duration: 3000,
                position: 'top-center',
                style: {
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px',
                },
            });
        }
    };

    const handleDelete = async () => {
        if (!feedback) return;

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                toast.error('Please login to delete feedback');
                return;
            }

            const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/cake_reviews/${feedback.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                toast.success('Feedback deleted successfully');
                router.push('/orderHistory');
            } else {
                throw new Error('Failed to delete feedback');
            }
        } catch (err) {
            toast.error('Failed to delete feedback');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-500">{error}</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => router.push('/login')}
                        >
                            Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="max-w-2xl mx-auto border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 p-6">
                        <CardTitle className="text-2xl font-bold">Leave Your Feedback</CardTitle>
                        <p className="text-muted-foreground mt-2">
                            Share your experience with us
                        </p>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Rating Section */}
                            <div className="space-y-2">
                                <Label>Rating</Label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`h-8 w-8 ${star <= rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="space-y-2">
                                <Label>Your Feedback</Label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Share your experience with this cake..."
                                    className="min-h-[150px]"
                                    required
                                />
                            </div>

                            {/* Image Upload Section */}
                            <div className="space-y-2">
                                <Label>Add Photo (Optional)</Label>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <Label
                                            htmlFor="image-upload"
                                            className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted/50 transition-colors"
                                        >
                                            <ImageIcon className="h-5 w-5" />
                                            Choose Image
                                        </Label>
                                    </div>
                                    {previewUrl && (
                                        <div className="relative h-20 w-20 rounded-md overflow-hidden">
                                            <Image
                                                src={previewUrl}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewUrl(null);
                                                    setImageFile(null);
                                                }}
                                                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                            >
                                                <Trash2 className="h-3 w-3 text-white" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4">
                                {feedback && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleDelete}
                                        className="flex items-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    className="flex items-center gap-2"
                                >
                                    {isEditing ? (
                                        <>
                                            <Edit2 className="h-4 w-4" />
                                            Update Feedback
                                        </>
                                    ) : (
                                        'Submit Feedback'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default FeedbackPage;
