import { Link } from "react-router-dom";
import type { BreadcrumbItemConfig } from "./types";
import { truncateLabel } from "./routeUtils";

interface BreadcrumbItemProps {
  item: BreadcrumbItemConfig;
  isLast: boolean;
  maxLabelLength: number;
}

export function BreadcrumbItem({
  item,
  isLast,
  maxLabelLength,
}: BreadcrumbItemProps) {
  const displayLabel = truncateLabel(item.label, maxLabelLength);
  const isTruncated = displayLabel !== item.label;

  const content = (
    <span className="inline-flex items-center gap-1.5">
      {item.icon && (
        <span className="flex-shrink-0 w-4 h-4" aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span>{displayLabel}</span>
    </span>
  );

  if (isLast) {
    return (
      <li aria-current="page">
        <span
          className="text-viaduct-text-primary font-medium text-sm"
          {...(isTruncated ? { title: item.label } : {})}
        >
          {content}
        </span>
      </li>
    );
  }

  return (
    <li>
      <Link
        to={item.href ?? "#"}
        className="text-viaduct-text-secondary hover:text-viaduct-accent transition-colors text-sm"
        {...(isTruncated ? { title: item.label } : {})}
      >
        {content}
      </Link>
    </li>
  );
}
