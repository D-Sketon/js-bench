'use client';

import React, { useState } from 'react';
import { useTranslation } from '../i18n';
import { ExpiryOption } from '../lib/redis';
import {
  Share2,
  Copy,
  Check,
  X,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (title: string, expiryOption: ExpiryOption) => Promise<void>;
  isSharing: boolean;
  shareUrl: string;
  onCopyUrl: () => void;
  copied: boolean;
  onCloseSuccess: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  onShare,
  isSharing,
  shareUrl,
  onCopyUrl,
  copied,
  onCloseSuccess,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [expiryOption, setExpiryOption] = useState<ExpiryOption>('30d');
  const [validationError, setValidationError] = useState('');

  const handleShare = async () => {
    setValidationError('');
    
    if (!title.trim()) {
      setValidationError(t('enterShareTitle'));
      return;
    }

    try {
      await onShare(title.trim(), expiryOption);
    } catch {
      setValidationError(t('shareFailed'));
    }
  };

  const handleClose = () => {
    setTitle('');
    setExpiryOption('30d');
    setValidationError('');
    onClose();
  };

  const handleSuccessClose = () => {
    setTitle('');
    setExpiryOption('30d');
    setValidationError('');
    onCloseSuccess();
  };

  const getExpiryDescription = (option: ExpiryOption): string => {
    switch (option) {
      case '7d':
        return t('shareExpiry7dDesc');
      case '30d':
        return t('shareExpiry30dDesc');
      default:
        return t('shareExpiry30dDesc');
    }
  };

  if (!isOpen && !shareUrl) return null;

  if (shareUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Check className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {t('shareSuccess')}
                </h3>
              </div>
              <button
                onClick={handleSuccessClose}
                className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                {t('shareUrl')}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary text-sm font-mono"
                />
                <button
                  onClick={onCopyUrl}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span className="text-sm">
                    {copied ? t('copied') : t('copyLink')}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSuccessClose}
                className="px-4 py-2 text-gray-600 dark:text-dark-text-secondary hover:text-gray-800 dark:hover:text-dark-text-primary transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Share2 className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {t('share')}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              {t('shareTitle')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder={t('shareTitlePlaceholder')}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 transition-colors ${
                validationError
                  ? 'border-red-300 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400'
                  : 'border-gray-300 dark:border-dark-border-primary focus:ring-blue-500 dark:focus:ring-dark-accent-blue focus:border-blue-500 dark:focus:border-dark-accent-blue'
              }`}
            />
            {validationError && (
              <div className="mt-2 flex items-center space-x-2 text-red-600 dark:text-red-400">
                <AlertCircle size={16} />
                <span className="text-sm">{validationError}</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span>{t('shareExpiry')}</span>
              </div>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['7d', '30d'] as ExpiryOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setExpiryOption(option)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    expiryOption === option
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-dark-bg-tertiary border-gray-300 dark:border-dark-border-primary text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-primary'
                  }`}
                >
                  {option === '7d' && t('shareExpiry7d')}
                  {option === '30d' && t('shareExpiry30d')}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-dark-text-muted">
              {t('shareExpiryDescription')}: {getExpiryDescription(expiryOption)}
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={isSharing}
              className="px-4 py-2 text-gray-600 dark:text-dark-text-secondary hover:text-gray-800 dark:hover:text-dark-text-primary disabled:opacity-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {isSharing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Share2 size={16} />
              )}
              <span>
                {isSharing ? t('shareGenerating') : t('confirm')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 