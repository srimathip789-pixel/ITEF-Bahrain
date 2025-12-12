import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { PuzzleService } from '../../services/PuzzleService';

interface ShareButtonProps {
    puzzleId: string;
}

export default function ShareButton({ puzzleId }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const handleWhatsAppShare = () => {
        const whatsappLink = PuzzleService.generateWhatsAppLink(puzzleId);
        window.open(whatsappLink, '_blank');
        setShowOptions(false);
    };

    const handleCopyLink = async () => {
        const success = await PuzzleService.copyLinkToClipboard(puzzleId);
        if (success) {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setShowOptions(false);
            }, 2000);
        }
    };

    return (
        <div className="share-button-container">
            <button
                className="share-button"
                onClick={() => setShowOptions(!showOptions)}
            >
                <Share2 size={20} />
                <span>Share</span>
            </button>

            {showOptions && (
                <div className="share-options">
                    <button className="share-option whatsapp" onClick={handleWhatsAppShare}>
                        <span className="whatsapp-icon">💬</span>
                        Share on WhatsApp
                    </button>

                    <button className="share-option copy" onClick={handleCopyLink}>
                        {copied ? (
                            <>
                                <Check size={16} />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy size={16} />
                                Copy Link
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
