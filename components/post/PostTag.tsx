import Link from "next/link";

type PostTagProps = {
  children: string;
};

function getTagHref(tag: string) {
  return `/tags/${encodeURIComponent(tag)}`;
}

export function PostTag({ children }: PostTagProps) {
  const className =
    "rounded-full bg-tag-bg px-2 py-1 text-xs font-medium text-brand md:text-[13px] xl:text-sm";

  return (
    <Link
      href={getTagHref(children)}
      className={className}
      data-post-tag="true"
      aria-label={`${children} 태그 글 보기`}
    >
      {children}
    </Link>
  );
}
