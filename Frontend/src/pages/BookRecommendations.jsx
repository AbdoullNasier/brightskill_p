import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { MdShoppingCart } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const BookRecommendations = () => {
    const { apiRequest } = useAuth();
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const loadBooks = async () => {
            const response = await apiRequest('/books/');
            if (!response.ok) {
                setBooks([]);
                return;
            }
            const data = await response.json();
            setBooks(Array.isArray(data) ? data : []);
        };

        loadBooks();
    }, []);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommended Books</h1>
            <p className="text-gray-600 mb-8">AI-curated reads from your real learning activity.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {books.length === 0 && <Card className="p-4">No recommendations yet. Complete courses or AI sessions first.</Card>}
                {books.map((book) => (
                    <Card key={book.id} className="p-4 flex flex-col h-full hover:shadow-lg transition-shadow">
                        <div className="h-48 bg-gray-100 rounded mb-4 flex items-center justify-center overflow-hidden text-sm text-gray-500">Book</div>
                        <h2 className="font-bold text-lg mb-1 line-clamp-2">{book.title}</h2>
                        <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                        <p className="text-sm text-gray-600 mb-4">{book.reason}</p>
                        <div className="mt-auto">
                            <Button className="w-full flex justify-center items-center text-sm">
                                <MdShoppingCart className="mr-2" /> Get Book
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default BookRecommendations;
