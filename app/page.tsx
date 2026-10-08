import EnterpriseSection from "@/components/home/enterprise-section";
import ForkSection from "@/components/home/fork-section";
import HaulrFooter from "@/components/home/haulr-footer";
import HaulrNav from "@/components/home/haulr-nav";
import LanesBand from "@/components/home/lanes-band";
import Lifecycle from "@/components/home/lifecycle";
import PaySection from "@/components/home/pay-section";
import ProductsSection from "@/components/home/products-section";
import QuoteClose from "@/components/home/quote-close";
import TargetsSection from "@/components/home/targets-section";
import TrailRule from "@/components/home/trail-rule";

export default function Home() {
    return (
        <>
            <HaulrNav />
            <main>
                <Lifecycle />
                <TrailRule />
                <TargetsSection />
                <ProductsSection />
                <LanesBand />
                <PaySection />
                <EnterpriseSection />
                <ForkSection />
                <TrailRule />
                <QuoteClose />
            </main>
            <TrailRule />
            <HaulrFooter />
        </>
    );
}
