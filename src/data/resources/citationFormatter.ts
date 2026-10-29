import type { ResourceItem } from './types';

/**
 * Formats an individual resource item into an academic/standard citation.
 */
export function formatCitation(resource: ResourceItem): string {
  const parts: string[] = [];

  // Authors / Organization
  parts.push(`${resource.authorsOrOrganization}.`);

  // Title
  parts.push(`"${resource.title}"`);

  // Version or Commit if available
  if (resource.versionOrCommit) {
    parts.push(`(Revision: ${resource.versionOrCommit})`);
  }

  // Role and Module
  parts.push(`[${resource.resourceRole} - BoneVista: ${resource.relatedModule}].`);

  // License
  parts.push(`License: ${resource.licenseName}.`);

  // URL
  parts.push(`Available at: ${resource.sourceUrl}`);

  return parts.join(' ');
}

/**
 * Formats a collection of resources for group-level copying.
 * Each reference is distinctly separated and identified.
 */
export function formatGroupCitations(categoryTitle: string, resources: ResourceItem[]): string {
  const header = `BoneVista Citations — ${categoryTitle}\n${'='.repeat(40)}\n`;
  const entries = resources.map((res, index) => {
    return [
      `[${index + 1}] ${res.title}`,
      `    Author/Org: ${res.authorsOrOrganization}`,
      res.versionOrCommit ? `    Revision: ${res.versionOrCommit}` : null,
      `    Role: ${res.resourceRole}`,
      `    License: ${res.licenseName} (${res.licenseUrl})`,
      `    Verification: ${res.verificationStatus}`,
      `    Source: ${res.sourceUrl}`,
      `    Citation: ${res.citationText}`
    ].filter(Boolean).join('\n');
  });

  return `${header}\n${entries.join('\n\n')}\n`;
}
