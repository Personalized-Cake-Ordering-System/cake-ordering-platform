"use client"

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Image as ImageIcon, FileText, ArrowRight, Star, Calendar, LucideIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

// Types and Interfaces
interface IconContainerProps {
    children: React.ReactNode;
    isHovered: boolean;
    isDarkMode: boolean;
}

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    index: number;
    isDarkMode: boolean;
}

interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
}

// Loading Component
const LoadingSpinner = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-full"
    >
        <div className="relative w-16 h-16">
            <div className="absolute border-4 border-orange-200 dark:border-orange-800 rounded-full w-16 h-16"></div>
            <div className="absolute border-4 border-orange-500 dark:border-orange-400 rounded-full w-16 h-16 border-t-transparent animate-spin"></div>
        </div>
    </motion.div>
);

// Icon Container Component
const IconContainer: React.FC<IconContainerProps> = ({ children, isHovered, isDarkMode }) => (
    <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`p-4 rounded-2xl shadow-lg transition-all duration-300 ${isHovered
                ? 'bg-gradient-to-br from-orange-400 to-orange-500 dark:from-orange-600 dark:to-orange-700'
                : isDarkMode
                    ? 'bg-gradient-to-br from-gray-800 to-gray-700'
                    : 'bg-gradient-to-br from-orange-100 to-orange-50'
            }`}
    >
        {children}
    </motion.div>
);

// Feature Card Component
const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, index, isDarkMode }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`group relative flex items-start gap-6 p-6 rounded-2xl transition-all duration-300 ${isDarkMode
                    ? 'hover:bg-gray-800/70'
                    : 'hover:bg-white/70'
                }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <IconContainer isHovered={isHovered} isDarkMode={isDarkMode}>
                <Icon className={`w-6 h-6 transition-colors duration-300 ${isHovered
                        ? 'text-white'
                        : isDarkMode
                            ? 'text-orange-400'
                            : 'text-orange-500'
                    }`} />
            </IconContainer>
            <div className="flex-1">
                <motion.h4
                    className={`font-bold text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                >
                    {title}
                </motion.h4>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>{description}</p>
                <motion.div
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    className="h-0.5 bg-gradient-to-r from-orange-400 to-purple-500 mt-4"
                />
            </div>
        </motion.div>
    );
};

const EleganceSection: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // After mounting, we can safely show the UI
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && theme === 'dark';

    const features: Feature[] = [
        {
            icon: ImageIcon,
            title: "Explore Our Gallery",
            description: "Discover your dream cake through our curated collection of masterpieces, each telling its own unique story of creativity and craftsmanship."
        },
        {
            icon: Calendar,
            title: "Upcoming Events",
            description: "Join our exclusive cake design workshops and tasting sessions. Learn from master bakers and explore the art of cake decoration."
        },
        {
            icon: FileText,
            title: "Quality Commitment",
            description: "We use only premium ingredients and cutting-edge techniques to ensure every cake exceeds your expectations in taste and design."
        },
        {
            icon: Star,
            title: "Special Occasions",
            description: "From elegant weddings to festive birthdays, we create bespoke cakes that become the centerpiece of your celebration."
        }
    ];

    if (!mounted) return <LoadingSpinner />;

    return (
        <React.Suspense fallback={<LoadingSpinner />}>
            <section className={`relative ${isDarkMode
                    ? 'bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900'
                    : 'bg-gradient-to-br from-white via-orange-50 to-purple-50'
                } py-32 overflow-hidden transition-colors duration-300`}>
                {/* Animated Background Elements */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: isDarkMode ? 0.15 : 0.2, scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className={`absolute top-0 left-0 w-[800px] h-[800px] ${isDarkMode
                            ? 'bg-gradient-to-br from-orange-800 to-orange-900'
                            : 'bg-gradient-to-br from-orange-200 to-orange-300'
                        } rounded-full filter blur-3xl`}
                    style={{ transform: 'translate(-50%, -50%)' }}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: isDarkMode ? 0.1 : 0.15, scale: 1 }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                    className={`absolute bottom-0 right-0 w-[1000px] h-[1000px] ${isDarkMode
                            ? 'bg-gradient-to-br from-purple-900 to-pink-900'
                            : 'bg-gradient-to-br from-purple-200 to-pink-200'
                        } rounded-full filter blur-3xl`}
                    style={{ transform: 'translate(50%, 50%)' }}
                />

                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-12"
                        >
                            <div>
                                <motion.span
                                    className={`inline-block ${isDarkMode
                                            ? 'text-orange-400 bg-orange-950'
                                            : 'text-orange-500 bg-orange-100'
                                        } font-medium mb-4 px-4 py-1 rounded-full`}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Elegance Personified
                                </motion.span>
                                <h2 className="text-6xl font-black mb-6 leading-tight">
                                    <span className={`bg-gradient-to-r ${isDarkMode
                                            ? 'from-purple-400 via-orange-400 to-pink-400'
                                            : 'from-purple-900 via-orange-600 to-pink-600'
                                        } bg-clip-text text-transparent`}>
                                        Celebrating
                                        <br />
                                        Sweet Moments
                                    </span>
                                </h2>
                            </div>

                            <div className={`space-y-6 backdrop-blur-sm ${isDarkMode
                                    ? 'bg-gray-900/60'
                                    : 'bg-white/40'
                                } rounded-3xl p-8 shadow-xl`}>
                                {features.map((feature, index) => (
                                    <FeatureCard
                                        key={index}
                                        index={index}
                                        icon={feature.icon}
                                        title={feature.title}
                                        description={feature.description}
                                        isDarkMode={isDarkMode}
                                    />
                                ))}
                            </div>

                            <motion.div
                                className="flex items-center gap-6"
                                whileHover={{ x: 10 }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-8 py-4 bg-gradient-to-r ${isDarkMode
                                            ? 'from-purple-700 via-orange-600 to-pink-700'
                                            : 'from-purple-900 via-orange-600 to-pink-600'
                                        } text-white rounded-full font-medium text-lg flex items-center gap-2 shadow-lg hover:shadow-xl`}
                                >
                                    Start Creating
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-medium`}>
                                    Join 2,000+ happy customers
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative h-[700px] rounded-3xl overflow-hidden shadow-2xl group"
                        >
                            <motion.div
                                className={`absolute inset-0 bg-gradient-to-t ${isDarkMode
                                        ? 'from-black/70 via-black/30 to-transparent'
                                        : 'from-black/50 via-black/20 to-transparent'
                                    } z-10`}
                                whileHover={{ opacity: 0.8 }}
                            />
                            <Image
                                src="/imagecake3.jpg"
                                alt="Luxury Custom Cake"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                priority
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className={`${isDarkMode
                                            ? 'bg-gray-900/30'
                                            : 'bg-white/10'
                                        } backdrop-blur-md rounded-2xl p-6`}
                                >
                                    <h3 className="text-white text-2xl font-bold mb-2">
                                        Crafted with Passion
                                    </h3>
                                    <p className="text-white/90">
                                        Every detail meticulously designed to create your perfect moment
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </React.Suspense>
    );
};

export default EleganceSection;