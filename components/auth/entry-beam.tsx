export default function EntryBeam() {
    return (
        <div aria-hidden className="haulr-beam pointer-events-none absolute inset-y-0 left-0 z-50 w-(--haulr-beam) mix-blend-plus-lighter">
            <span className="absolute inset-0 bg-linear-to-r from-transparent to-(--haulr-hot)/[0.06]" />
            <span className="absolute inset-y-0 right-0 w-24 bg-linear-to-r from-transparent to-(--haulr-hot)/15" />
            <span className="absolute inset-y-0 right-0 w-px bg-(--haulr-hot) shadow-[0_0_18px_3px_var(--colors-accent)]" />
        </div>
    );
}
