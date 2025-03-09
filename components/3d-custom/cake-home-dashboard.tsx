"use client"

import * as React from 'react';
import HeaderDashboard from './header';
import CakeCollection from './cake-collection';
import EleganceSection from './elegance-section';
import Footer from './footer-home-page';

export default function CakeHomeDashboard() {

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">

            {/* Header and Banner Here */}
            <>
                <HeaderDashboard />
            </>

            {/* Cake Collection Here */}
            <>
                <CakeCollection />
            </>

            {/* HomePageNext Here */}
            <>
                <EleganceSection />
            </>

            {/* Footer Here */}
            <>
                <Footer />
            </>
        </div>
    );
}