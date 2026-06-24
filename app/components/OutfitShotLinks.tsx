type OutfitShotLinksProps = {
  productName: string;
};

type OutfitLink = {
  label: string;
  href: string;
};

function buildOutfitLinks(productName: string): OutfitLink[] {
  const query = productName.trim();
  if (!query) return [];

  const encodedName = encodeURIComponent(query);
  const encodedWearQuery = encodeURIComponent(`${query} 착용`);

  return [
    {
      label: "라쿠텐",
      href: `https://search.rakuten.co.jp/search/mall/${encodedName}/`
    },
    {
      label: "인스타그램",
      href: `https://www.instagram.com/explore/tags/${encodedName}/`
    },
    {
      label: "구글 이미지",
      href: `https://www.google.com/search?tbm=isch&q=${encodedWearQuery}`
    }
  ];
}

export default function OutfitShotLinks({ productName }: OutfitShotLinksProps) {
  const links = buildOutfitLinks(productName);
  if (links.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-base font-semibold text-slate-900">착용샷 찾기</h2>
      <p className="mt-1 text-sm text-slate-600">{productName} 관련 착용샷을 외부에서 검색합니다.</p>

      <div className="mt-4 flex flex-wrap gap-3">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
