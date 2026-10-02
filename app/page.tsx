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

export default function Home() {
    return (
        <>
            <HaulrNav />
            <main>
                <Lifecycle />
                <TargetsSection />
                <ProductsSection />
                <LanesBand />
                <PaySection />
                <EnterpriseSection />
                <ForkSection />
                <QuoteClose />
            </main>
            <HaulrFooter />
        </>
    );
}
