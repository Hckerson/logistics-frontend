import ForkSection from "@/components/home/fork-section";
import HaulrFooter from "@/components/home/haulr-footer";
import HaulrNav from "@/components/home/haulr-nav";
import LanesBand from "@/components/home/lanes-band";
import Lifecycle from "@/components/home/lifecycle";
import QuoteClose from "@/components/home/quote-close";

export default function Home() {
    return (
        <>
            <HaulrNav />
            <main>
                <Lifecycle />
                <ForkSection />
                <LanesBand />
                <QuoteClose />
            </main>
            <HaulrFooter />
        </>
    );
}
