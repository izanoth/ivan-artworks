


export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className="blinking-text block text-xs pb-4">LOADING</p>
            <span className="loader"></span>
        </div>
    );
}