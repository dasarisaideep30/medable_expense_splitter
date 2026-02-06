import { useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    type?: "info" | "danger" | "success";
    confirmText?: string;
    onConfirm?: () => void;
}

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    type = "info",
    confirmText,
    onConfirm
}: ModalProps) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-slideUp"
                role="dialog"
                aria-modal="true"
            >
                {/* Header - Purple Theme */}
                <div className="bg-[#8b5cf6] px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {type === 'danger' && '⚠️'}
                        {type === 'success' && '✅'}
                        {type === 'info' && 'ℹ️'}
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors text-2xl leading-none focus:outline-none"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                        {children}
                    </p>

                    {/* Footer / Actions */}
                    <div className="mt-8 flex justify-end gap-3">
                        {onConfirm ? (
                            <>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`px-5 py-2 text-white rounded-lg shadow-md transition-transform active:scale-95 font-medium text-sm ${type === 'danger'
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-[#8b5cf6] hover:bg-[#7c3aed]'
                                        }`}
                                >
                                    {confirmText}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-[#8b5cf6] text-white rounded-lg shadow-md hover:bg-[#7c3aed] transition-transform active:scale-95 font-medium text-sm"
                            >
                                Got it
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
