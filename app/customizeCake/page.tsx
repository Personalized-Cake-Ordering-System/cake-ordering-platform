import CakeCustomizer from '@/components/3d-custom/cake-customize'
import Header from '@/components/shared/client/header/header'
import Footer from '@/components/shared/client/footer/footer'
export default function CustomizeCakePage() {
    return (
        <div className="container py-8">
            <Header />
            <h1 className="text-3xl font-bold mb-6 text-center">Customize Your Cake</h1>
            <CakeCustomizer />
            <Footer />
        </div>
    )
} 