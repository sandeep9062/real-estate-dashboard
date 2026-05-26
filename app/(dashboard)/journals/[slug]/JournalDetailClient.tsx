"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Container,
  Title,
  Text,
  Image,
  Stack,
  Badge,
  Group,
  Divider,
  Skeleton,
  Button,
  Paper,
} from "@mantine/core";
import { useGetJournalBySlugQuery } from "@/services/journalApi";

import {
  IconCalendar,
  IconUser,
  IconArrowLeft,
  IconHome,
} from "@tabler/icons-react";
import Link from "next/link";

interface JournalDetailClientProps {
  slug: string;
}

// Ensure blank lines between markdown block elements (headers, lists, paragraphs)
// Markdown requires \n\n (double newline) to recognize block-level elements
function ensureMarkdownSpacing(content: string): string {
  return (
    content
      // Ensure double newline BEFORE any heading line
      .replace(/\n(#{1,6} .+)/g, "\n\n$1")
      // Ensure double newline AFTER any heading line
      .replace(/(#{1,6} .+)\n(?!\n)/g, "$1\n\n")
      // Ensure double newline BEFORE any list item (starts with -, *, or number.)
      .replace(/\n((?:[-*]|\d+\.) .+)/g, "\n\n$1")
      // Ensure double newline AFTER any list item if next line is NOT also a list item
      .replace(
        /((?:[-*]|\d+\.) .+)\n(?!\n)(?!(?:\s*(?:[-*]|\d+\.) ))/g,
        "$1\n\n",
      )
      // Normalize triple+ newlines to just double newlines
      .replace(/\n{3,}/g, "\n\n")
      // Trim leading/trailing whitespace
      .trim()
  );
}

export default function JournalDetailClient({
  slug,
}: JournalDetailClientProps) {
  // 1. Fetch Journal Content
  const { data: journal, isLoading: journalLoading } =
    useGetJournalBySlugQuery(slug);

  if (journalLoading)
    return (
      <Container size="xl" py={100} px={{ base: 8, md: 12, lg: 16 }}>
        <Skeleton height={400} radius="md" />
      </Container>
    );

  if (!journal)
    return (
      <Container
        size="xl"
        py={100}
        ta="center"
        px={{ base: 8, md: 12, lg: 16 }}
      >
        <Title>Guide not found</Title>
      </Container>
    );

  return (
    <Container size="xl" py={80} px={{ base: 8, md: 12, lg: 16 }}>
      <Button
        component={Link}
        href="/journals"
        color="#4161df"
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        mb="xl"
      >
        Back to Insights
      </Button>

      <Stack gap="lg">
        <Badge size="lg" variant="filled" color="#4161df">
          {journal.category}
        </Badge>

        <Title order={1} size="42px" fw={900} style={{ lineHeight: 1.1 }}>
          {journal.title}
        </Title>

        <Group gap="xl" c="dimmed">
          <Group gap={5}>
            <IconCalendar size={18} />
            <Text size="sm">
              {new Date(journal.createdAt).toLocaleDateString("en-IN")}
            </Text>
          </Group>
          <Group gap={5}>
            <IconUser size={18} />
            <Text size="sm">PropertyBulbul Editorial</Text>
          </Group>
        </Group>

        <Image
          src={
            journal.coverImage ||
            "https://images.unsplash.com/photo-1590066305974-26999a08ec40?q=80&w=1200"
          }
          radius="md"
          alt={journal.title}
          h={200}
          w="100%"
        />

        {/* Render journal content as markdown with secure link handling */}
        <div className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#4161df", textDecoration: "underline" }}
                  {...props}
                />
              ),
            }}
          >
            {ensureMarkdownSpacing(journal.content)}
          </ReactMarkdown>
        </div>
      </Stack>
    </Container>
  );
}
