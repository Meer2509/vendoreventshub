import CategoryEventsClient from "@/components/CategoryEventsClient";
import { getCategoryBySlug } from "@/lib/categories";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return buildPageMetadata({
      title: "Vendor Events by Category",
      path: `/events/category/${categorySlug}`,
    });
  }

  return buildPageMetadata({
    title: category.headline,
    description: category.description,
    path: `/events/category/${category.slug}`,
    keywords: category.keywords,
  });
}

export default async function CategoryEventsPage({ params }: Props) {
  const { category } = await params;
  return <CategoryEventsClient categorySlug={category} />;
}
