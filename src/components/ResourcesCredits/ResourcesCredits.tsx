import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Search,
  X,
  FileText,
  ShieldCheck,
  BookOpen,
  Info
} from 'lucide-react';
import {
  resourceCategories,
  searchResources,
  type ResourceCategory,
  type ResourceCategoryInfo
} from '../../data/resources';
import { formatCitation, formatGroupCitations } from '../../data/resources/citationFormatter';
import styles from './ResourcesCredits.module.css';

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

interface ModalState {
  isOpen: boolean;
  category: ResourceCategoryInfo | null;
  mode: 'source' | 'license' | 'citation' | 'all';
}

export const ResourcesCredits: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    category: null,
    mode: 'all'
  });

  // Handle clipboard copy with feedback
  const handleCopyCitation = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2200);
    }
  };

  // Filter cards and matching resources
  const filteredCategories = useMemo(() => {
    return resourceCategories
      .map((cat) => {
        // If category filter active and not matching, omit
        if (selectedCategory !== 'all' && cat.id !== selectedCategory) {
          return null;
        }

        if (!searchQuery.trim()) {
          return cat;
        }

        const matchingItems = searchResources(searchQuery, cat.id);
        const matchesCatMeta =
          cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.description.toLowerCase().includes(searchQuery.toLowerCase());

        if (matchingItems.length > 0 || matchesCatMeta) {
          return {
            ...cat,
            resources: matchingItems.length > 0 ? matchingItems : cat.resources
          };
        }

        return null;
      })
      .filter((cat): cat is ResourceCategoryInfo => cat !== null);
  }, [searchQuery, selectedCategory]);

  const openCategoryModal = (cat: ResourceCategoryInfo, mode: 'source' | 'license' | 'citation' | 'all') => {
    setModalState({ isOpen: true, category: cat, mode });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, category: null, mode: 'all' });
  };

  return (
    <div className={styles.container} data-testid="resources-credits-page">
      {/* 1. Centered GitHub Repository Identity Link */}
      <div className={styles.repoLinkWrap}>
        <a
          href="https://github.com/spixcy/BoneVista"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.repoBadge}
          title="Open BoneVista on GitHub"
        >
          <GithubIcon size={15} />
          <span>spixcy / BoneVista</span>
          <span className={styles.repoDot}>•</span>
          <ExternalLink size={12} className={styles.repoArrow} />
        </a>
      </div>

      {/* 2. Header: Title and Explanatory Subtitle */}
      <header className={styles.header}>
        <h1 className={styles.title}>Resources &amp; Credits</h1>
        <p className={styles.subtitle}>
          The anatomy, research, and open-source resources behind BoneVista.
        </p>
      </header>

      {/* 3. Search Field and Category Filter */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={14} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search anatomy, creators, licenses, or research…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search resources and citations"
            data-testid="resources-search-input"
          />
          {searchQuery && (
            <button
              className={styles.clearSearchBtn}
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className={styles.categoryPills}>
          <button
            className={`${styles.categoryPill} ${selectedCategory === 'all' ? styles.categoryPillActive : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Resources
          </button>
          {resourceCategories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryPill} ${selectedCategory === cat.id ? styles.categoryPillActive : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Exactly Four Resource Cards in Centered 2x2 Desktop Grid */}
      <div className={styles.cardsGrid}>
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat) => {
            const isCopied = copiedId === cat.id;
            const groupCitation = formatGroupCitations(cat.title, cat.resources);

            return (
              <article key={cat.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardThumbnailWrap}>
                    <img
                      src={cat.thumbnailUrl}
                      alt={cat.thumbnailAlt}
                      className={styles.cardThumbnail}
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardHeaderRow}>
                      <h2 className={styles.cardTitle}>{cat.title}</h2>
                      <span className={styles.resourceCountBadge}>
                        {cat.resources.length} {cat.resources.length === 1 ? 'source' : 'sources'}
                      </span>
                    </div>
                    <div className={styles.cardSubtitle} title={cat.subtitle}>
                      {cat.subtitle}
                    </div>
                    <p className={styles.cardDesc}>{cat.description}</p>
                  </div>
                </div>

                <div className={styles.cardDivider} />

                {/* 5. Focus Fox-Style Inline Actions */}
                <div className={styles.actionsRow}>
                  {cat.resources.length === 1 ? (
                    <a
                      href={cat.resources[0].sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.inlineActionBtn}
                      title={`Open source: ${cat.resources[0].title}`}
                    >
                      <ExternalLink size={12} />
                      <span>Source ↗</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      className={styles.inlineActionBtn}
                      onClick={() => openCategoryModal(cat, 'source')}
                      title="View all individual source repositories"
                    >
                      <ExternalLink size={12} />
                      <span>Sources ↗</span>
                    </button>
                  )}

                  <span className={styles.actionSeparator}>|</span>

                  {cat.resources.length === 1 ? (
                    <a
                      href={cat.resources[0].licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.inlineActionBtn}
                      title={`View license: ${cat.resources[0].licenseName}`}
                    >
                      <ShieldCheck size={12} />
                      <span>{cat.resources[0].licenseName} ↗</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      className={styles.inlineActionBtn}
                      onClick={() => openCategoryModal(cat, 'license')}
                      title="View individual licenses and verification status"
                    >
                      <ShieldCheck size={12} />
                      <span>Licenses ↗</span>
                    </button>
                  )}

                  <span className={styles.actionSeparator}>|</span>

                  <button
                    type="button"
                    className={`${styles.inlineActionBtn} ${isCopied ? styles.copiedTag : ''}`}
                    onClick={() => handleCopyCitation(groupCitation, cat.id)}
                    title="Copy formatted citation references for this category"
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{isCopied ? 'Copied!' : 'Copy Citation'}</span>
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <Info size={28} color="#60a5fa" />
            <div className={styles.emptyStateTitle}>No resources match your search</div>
            <p className={styles.emptyStateText}>
              We couldn't find any resources matching "{searchQuery}". Try searching by organ, author, standard (TA2), or license (CC BY-SA).
            </p>
            <button
              className={styles.resetFilterBtn}
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 6. Detail Drawer/Modal for Multi-Source Cards */}
      {modalState.isOpen && modalState.category && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <BookOpen size={18} color="#60a5fa" />
                <h3 className={styles.modalTitle}>
                  {modalState.category.title} — Sources &amp; Licensing
                </h3>
              </div>
              <button className={styles.modalCloseBtn} onClick={closeModal} title="Close dialog">
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalIntro}>
                Individual source provenance, exact commits, verified licenses, and attribution records for {modalState.category.title}:
              </p>

              {modalState.category.resources.map((item) => {
                const singleCitation = formatCitation(item);
                const isSingleCopied = copiedId === item.id;

                return (
                  <div key={item.id} className={styles.resourceCardItem}>
                    <div className={styles.resourceItemTop}>
                      <span className={styles.resourceItemTitle}>{item.title}</span>
                      <span
                        className={`${styles.statusBadge} ${
                          item.verificationStatus === 'Verified'
                            ? styles.statusVerified
                            : styles.statusNeedsVerification
                        }`}
                      >
                        {item.verificationStatus}
                      </span>
                    </div>

                    <div className={styles.resourceItemMeta}>
                      <span><strong>Author:</strong> {item.authorsOrOrganization}</span>
                      {item.versionOrCommit && (
                        <span><strong>Revision:</strong> <code>{item.versionOrCommit.slice(0, 10)}</code></span>
                      )}
                      <span><strong>Role:</strong> {item.resourceRole}</span>
                    </div>

                    <p className={styles.resourceItemDesc}>{item.description}</p>
                    <p className={styles.resourceItemDesc}><em>Usage: {item.boneVistaUsage}</em></p>

                    <div className={styles.resourceItemActions}>
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.resourceActionLink}
                      >
                        Source ↗
                      </a>
                      <a
                        href={item.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.resourceActionLink}
                      >
                        License ({item.licenseName}) ↗
                      </a>
                      <button
                        type="button"
                        className={`${styles.copySingleBtn} ${isSingleCopied ? styles.copiedTag : ''}`}
                        onClick={() => handleCopyCitation(singleCitation, item.id)}
                      >
                        {isSingleCopied ? <Check size={11} /> : <Copy size={11} />}
                        <span>{isSingleCopied ? 'Copied Citation' : 'Copy Citation'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.copyAllBtn}
                onClick={() =>
                  handleCopyCitation(
                    formatGroupCitations(
                      modalState.category!.title,
                      modalState.category!.resources
                    ),
                    modalState.category!.id
                  )
                }
              >
                <Copy size={14} />
                <span>
                  {copiedId === modalState.category.id ? 'Copied All Citations!' : 'Copy All Citations'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Subtle Attribution and Legal Documentation Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerNote}>
          For complete license terms and attribution requirements, see LICENSES.md and the asset-specific notices:
        </p>
        <div className={styles.footerLinks}>
          <a
            href="https://github.com/spixcy/BoneVista/blob/Ui/LICENSES.md"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            <FileText size={11} style={{ display: 'inline', marginRight: 4 }} />
            LICENSES.md
          </a>
          <span className={styles.footerSep}>•</span>
          <a
            href="https://github.com/spixcy/BoneVista/blob/Ui/public/anatomy/NOTICE"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            public/anatomy/NOTICE
          </a>
          <span className={styles.footerSep}>•</span>
          <a
            href="https://github.com/spixcy/BoneVista/blob/Ui/public/muscle-atlas/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            public/muscle-atlas/README.md
          </a>
          <span className={styles.footerSep}>•</span>
          <a
            href="https://github.com/spixcy/BoneVista/blob/Ui/public/neuro/NOTICE.md"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            public/neuro/NOTICE.md
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ResourcesCredits;
