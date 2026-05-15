import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Box, Avatar } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import StarIcon from "@mui/icons-material/Star";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ReplyIcon from "@mui/icons-material/Reply";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import withLayoutMain from "@/layout/LayoutHome";
import { initializeApollo } from "@/apollo/client";
import { userVar } from "@/apollo/store";
import { GET_PACKAGE, GET_PACKAGES } from "@/apollo/user/query";
import { LIKE_TARGET_PACKAGE } from "@/apollo/package/mutation";
import { GET_COMMENTS } from "@/apollo/comment/query";
import { CREATE_COMMENT } from "@/apollo/comment/mutation";
import { PURCHASE_POLICY } from "@/apollo/policy/mutation";
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from "@/libs/sweetAlert";
import { toAssetUrl } from "@/libs/api";
import { formatCount } from '@/libs/utils/format';
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";

export const getServerSideProps = async ({ locale = "en" }: { locale?: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

/* ── Types ───────────────────────────────────────── */

interface MemberData {
  _id: string;
  memberNick?: string | null;
  memberImage?: string | null;
}

interface PackageDetail {
  _id: string;
  packageType: string;
  packageStatus: string;
  packageTitle: string;
  packageDesc?: string | null;
  packagePrice: number;
  packageCoverageLimit?: number | null;
  packageMinAge?: number | null;
  packageMaxAge?: number | null;
  packageAssetTags?: string[] | null;
  packageImages?: string[] | null;
  packageViews?: number | null;
  packageLikes?: number | null;
  packageComments?: number | null;
  memberData?: MemberData | null;
  meLiked?: { myFavorite: boolean }[] | null;
}

interface Comment {
  _id: string;
  commentContent: string;
  createdAt: string;
  memberData?: MemberData | null;
}

interface RelatedPackage {
  _id: string;
  packageType: string;
  packageTitle: string;
  packagePrice: number;
  packageImages?: string[] | null;
}

interface PurchasedPolicy {
  _id: string;
  policyStatus: string;
  packageId: string;
  packageName: string;
  premiumAmount: number;
  startDate: string;
  endDate: string;
}

/* ── Helpers ─────────────────────────────────────── */

const getImage = (images?: string[] | null) =>
  toAssetUrl(images?.[0]) ?? "/img/placeholder-article.svg";

const getMemberImage = (image?: string | null) =>
  toAssetUrl(image);

const formatCoverage = (n?: number | null) => {
  if (n == null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
};

const typeLabel = (t: string) =>
  ({
    AUTO: "Car Insurance",
    HOME: "Home Insurance",
    HEALTH: "Health Insurance",
    TRAVEL: "Travel Insurance",
  })[t] ?? t;

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

/* ── Page ────────────────────────────────────────── */

const PackageDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [applying, setApplying] = useState(false);

  const [related, setRelated] = useState<RelatedPackage[]>([]);

  /* Fetch package */
  useEffect(() => {
    if (!router.isReady || !id || typeof id !== "string") return;
    const client = initializeApollo(null);
    setLoading(true);
    client
      .query<{ getPackage: PackageDetail }>({
        query: GET_PACKAGE,
        variables: { packageId: id },
        fetchPolicy: "no-cache",
      })
      .then((res) => {
        const p = res.data.getPackage;
        setPkg(p);
        setLiked(p.meLiked?.[0]?.myFavorite ?? false);
        setLikeCount(p.packageLikes ?? 0);
      })
      .catch((err: any) => {
        const msg = err?.graphQLErrors?.[0]?.message ?? err?.message ?? "";
        setError(
          msg === "No data found!"
            ? "Insurance not found."
            : "Failed to load. Please try again.",
        );
      })
      .finally(() => setLoading(false));
  }, [router.isReady, id]);

  /* Fetch comments */
  useEffect(() => {
    if (!id || typeof id !== "string") return;
    const client = initializeApollo(null);
    client
      .query<{
        getComments: { list: Comment[]; metaCounter: { total: number }[] };
      }>({
        query: GET_COMMENTS,
        variables: {
          input: { page: 1, limit: 10, search: { commentRefId: id } },
        },
        fetchPolicy: "no-cache",
      })
      .then((res) => {
        setComments(res.data.getComments.list || []);
        setCommentTotal(res.data.getComments.metaCounter?.[0]?.total ?? 0);
      })
      .catch(() => {});
  }, [id]);

  /* Fetch related */
  useEffect(() => {
    if (!pkg) return;
    const client = initializeApollo(null);
    client
      .query<{ getPackages: { list: RelatedPackage[] } }>({
        query: GET_PACKAGES,
        variables: {
          input: {
            page: 1,
            limit: 4,
            sort: "packageViews",
            direction: "DESC",
            search: {},
          },
        },
        fetchPolicy: "no-cache",
      })
      .then((res) =>
        setRelated(
          (res.data.getPackages.list || [])
            .filter((p) => p._id !== pkg._id)
            .slice(0, 3),
        ),
      )
      .catch(() => {});
  }, [pkg]);

  /* Like */
  const handleLike = async () => {
    try {
      const user = userVar();
      if (!user?._id) {
        await sweetMixinErrorAlert("Please login to like packages.");
        return;
      }
      const client = initializeApollo(null);
      const res = await client.mutate<{ likeTargetPackage: PackageDetail }>({
        mutation: LIKE_TARGET_PACKAGE,
        variables: { packageId: id },
      });
      const updated = res.data?.likeTargetPackage;
      if (!updated) return;
      setLiked(updated.meLiked?.[0]?.myFavorite ?? false);
      setLikeCount(updated.packageLikes ?? 0);
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message ?? "Error updating like.",
      );
    }
  };

  /* Post comment */
  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      const user = userVar();
      if (!user?._id) {
        await sweetMixinErrorAlert("Please login to comment.");
        return;
      }
      setPostingComment(true);
      const client = initializeApollo(null);
      const res = await client.mutate<{ createComment: Comment }>({
        mutation: CREATE_COMMENT,
        variables: {
          input: {
            commentContent: commentText.trim(),
            commentRefId: id,
            commentGroup: "PACKAGE",
          },
        },
      });
      const newComment = res.data?.createComment;
      if (newComment) {
        setComments((prev) => [newComment, ...prev]);
        setCommentTotal((t) => t + 1);
        setCommentText("");
        await sweetTopSuccessAlert("Comment posted!");
      }
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message ?? "Could not post comment.",
      );
    } finally {
      setPostingComment(false);
    }
  };

  /* Apply */
  const handleApply = async () => {
    if (!id || typeof id !== "string") return;

    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert("Please login to apply for this package.");
      router.push("/account/join");
      return;
    }

    try {
      setApplying(true);
      const client = initializeApollo(null);
      const res = await client.mutate<{ purchasePolicy: PurchasedPolicy }>({
        mutation: PURCHASE_POLICY,
        variables: { input: { packageId: id } },
      });

      if (res.data?.purchasePolicy) {
        await sweetTopSuccessAlert("Application submitted successfully!");
      }
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message?.replace("Definer: ", "") ??
          err?.message ??
          "Could not submit your application.",
      );
    } finally {
      setApplying(false);
    }
  };

  /* ── Loading skeleton ────────────────────── */
  if (loading) {
    return (
      <Box className={"pd-page"}>
        <Box className={"pd-skeleton"}>
          <Box className={"pd-container"}>
            <Box className={"pd-main"}>
              <Box className={"sk-line"} style={{ width: 140, height: 22 }} />
              <Box
                className={"sk-line"}
                style={{ width: "65%", height: 44, marginTop: 12 }}
              />
              <Box className={"sk-img"} />
              <Box
                className={"sk-line"}
                style={{ width: "100%", height: 16, marginTop: 24 }}
              />
              <Box
                className={"sk-line"}
                style={{ width: "80%", height: 16, marginTop: 8 }}
              />
            </Box>
            <Box className={"pd-sidebar"}>
              <Box className={"sk-card"} />
              <Box
                className={"sk-card"}
                style={{ height: 200, marginTop: 16 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  /* ── Error ───────────────────────────────── */
  if (error) {
    return (
      <Box className={"pd-page"}>
        <Box className={"pd-error"}>
          <ShieldOutlinedIcon />
          <p>{error}</p>
          <button onClick={() => router.back()}>Go Back</button>
        </Box>
      </Box>
    );
  }

  if (!pkg) return null;

  /* ── Main render ─────────────────────────── */
  return (
    <Box className={"pd-page"}>
      {/* ── 2-col grid ── */}
      <Box className={"pd-container"}>
        {/* ── Left column ── */}
        <Box className={"pd-main"}>
          {/* Badges + title */}
          <Box className={"pd-header"}>
            <Box className={"pd-badges"}>
              <span className={"pd-type-badge"}>
                {typeLabel(pkg.packageType)}
              </span>
              {pkg.packageStatus === "ACTIVE" && (
                <span className={"pd-status-active"}>
                  <CheckCircleOutlinedIcon /> Active
                </span>
              )}
            </Box>
            <h1 className={"pd-title"}>{pkg.packageTitle}</h1>
          </Box>

          {/* Hero image */}
          <Box className={"pd-hero-img"}>
            <Box
              className={"pd-hero-bg"}
              style={{ backgroundImage: `url(${getImage(pkg.packageImages)})` }}
            />
            <Box className={"pd-hero-overlay"} />
          </Box>

          {/* Stats */}
          <Box className={"pd-stats"}>
            <span className={"pd-stat"}>
              <VisibilityOutlinedIcon />
              {formatCount(pkg.packageViews)} Views
            </span>
            <button
              className={`pd-stat pd-like${liked ? " liked" : ""}`}
              onClick={handleLike}
            >
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              {formatCount(likeCount)} Likes
            </button>
            <span className={"pd-stat"}>
              <ChatBubbleOutlinedIcon />
              {formatCount(commentTotal)} Comments
            </span>
          </Box>

          {/* Overview */}
          {pkg.packageDesc && (
            <Box component={"section"}>
              <h2 className={"pd-section-title"}>Package Overview</h2>
              <p className={"pd-overview-text"}>{pkg.packageDesc}</p>
            </Box>
          )}

          {/* Specs bento */}
          <Box component={"section"} className={"pd-specs"}>
            {pkg.packageCoverageLimit != null && (
              <Box className={"spec-card"}>
                <ShieldOutlinedIcon className={"spec-icon"} />
                <span className={"spec-label"}>COVERAGE LIMIT</span>
                <span className={"spec-value"}>
                  {formatCoverage(pkg.packageCoverageLimit)}
                </span>
              </Box>
            )}
            {pkg.packageMinAge != null && (
              <Box className={"spec-card"}>
                <EventRepeatIcon className={"spec-icon"} />
                <span className={"spec-label"}>AGE REQUIREMENT</span>
                <span className={"spec-value"}>
                  {pkg.packageMinAge} – {pkg.packageMaxAge ?? "∞"} yrs
                </span>
              </Box>
            )}
            {pkg.packageAssetTags && pkg.packageAssetTags.length > 0 && (
              <Box className={"spec-card"}>
                <LabelOutlinedIcon className={"spec-icon"} />
                <span className={"spec-label"}>ASSET TAGS</span>
                <Box className={"spec-tags"}>
                  {pkg.packageAssetTags.map((tag) => (
                    <span key={tag} className={"spec-tag"}>
                      {tag}
                    </span>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Comments */}
          <Box component={"section"} className={"pd-comments"}>
            <Box className={"pd-comments-header"}>
              <h2 className={"pd-section-title"}>User Comments</h2>
              <span className={"pd-comment-count"}>{commentTotal}</span>
            </Box>

            {/* Form */}
            <Box className={"pd-comment-form"}>
              <textarea
                className={"pd-comment-input"}
                placeholder={"Share your experience with this plan..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
              />
              <Box className={"pd-comment-form-footer"}>
                <button
                  className={"pd-post-btn"}
                  onClick={handlePostComment}
                  disabled={postingComment || !commentText.trim()}
                >
                  {postingComment ? "Posting…" : "Post Comment"}
                </button>
              </Box>
            </Box>

            {/* List */}
            <Box className={"pd-comments-list"}>
              {comments.length === 0 ? (
                <p className={"pd-no-comments"}>
                  No comments yet. Be the first!
                </p>
              ) : (
                comments.map((c) => (
                  <Box key={c._id} className={"pd-comment-item"}>
                    <Avatar
                      src={getMemberImage(c.memberData?.memberImage)}
                      sx={{ width: 40, height: 40, flexShrink: 0 }}
                    />
                    <Box className={"pd-comment-body"}>
                      <Box className={"pd-comment-meta"}>
                        <span className={"pd-comment-nick"}>
                          {c.memberData?.memberNick ?? "Member"}
                        </span>
                        <span className={"pd-comment-time"}>
                          {timeAgo(c.createdAt)}
                        </span>
                      </Box>
                      <p className={"pd-comment-text"}>{c.commentContent}</p>
                      <Box className={"pd-comment-actions"}>
                        <button className={"pd-action-btn"}>
                          <ThumbUpOutlinedIcon /> Like
                        </button>
                        <button className={"pd-action-btn"}>
                          <ReplyIcon /> Reply
                        </button>
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Box>

        {/* ── Sidebar ── */}
        <Box component={"aside"} className={"pd-sidebar"}>
          {/* Pricing card */}
          <Box className={"pd-pricing-card"}>
            <Box className={"pd-pricing-top"}>
              <span className={"pd-pricing-label"}>Monthly Premium</span>
              <Box className={"pd-pricing-amount"}>
                <span className={"pd-price"}>
                  ${pkg.packagePrice.toLocaleString()}
                </span>
                <span className={"pd-price-unit"}>/mo</span>
              </Box>
            </Box>
            <ul className={"pd-features"}>
              <li>
                <CheckCircleOutlinedIcon /> Zero Deductible Options
              </li>
              <li>
                <CheckCircleOutlinedIcon /> 24/7 Technical Support
              </li>
              <li>
                <CheckCircleOutlinedIcon /> Direct Digital Claims
              </li>
            </ul>
            <button
              className={"pd-apply-btn"}
              onClick={handleApply}
              disabled={applying || pkg.packageStatus !== "ACTIVE"}
            >
              {applying ? "Applying..." : "Apply Now"}
            </button>
          </Box>

          {/* Agent card */}
          {pkg.memberData && (
            <Box className={"pd-agent-card"}>
              <span className={"pd-agent-label"}>OFFERED BY</span>
              <Box className={"pd-agent-info"}>
                <Avatar
                  src={getMemberImage(pkg.memberData.memberImage)}
                  sx={{ width: 56, height: 56 }}
                />
                <Box className={"pd-agent-text"}>
                  <span className={"pd-agent-name"}>
                    {pkg.memberData.memberNick}
                  </span>
                  <span className={"pd-agent-role"}>Insurance Agent</span>
                </Box>
              </Box>
              <Box className={"pd-agent-meta"}>
                <span className={"pd-agent-badge"}>
                  <VerifiedIcon /> Identity Verified
                </span>
                <span className={"pd-agent-badge"}>
                  <StarIcon /> 4.9/5 Provider Rating
                </span>
              </Box>
              <button className={"pd-contact-btn"}>Contact Agent</button>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Related packages ── */}
      {related.length > 0 && (
        <Box component={"section"} className={"pd-related"}>
          <Box className={"pd-related-header"}>
            <Box>
              <h2 className={"pd-related-title"}>Recommended for You</h2>
              <p className={"pd-related-sub"}>
                Tailored insurance solutions based on your profile.
              </p>
            </Box>
            <button
              className={"pd-view-all"}
              onClick={() => router.push("/packages")}
            >
              View All Plans <ArrowForwardIcon />
            </button>
          </Box>
          <Box className={"pd-related-grid"}>
            {related.map((r) => (
              <Box
                key={r._id}
                className={"pd-related-card"}
                onClick={() => router.push(`/packages/${r._id}`)}
              >
                <Box className={"pd-rc-img-wrap"}>
                  <Box
                    className={"pd-rc-img"}
                    style={{
                      backgroundImage: `url(${getImage(r.packageImages)})`,
                    }}
                  />
                  <span className={"pd-rc-type"}>
                    {typeLabel(r.packageType)}
                  </span>
                </Box>
                <Box className={"pd-rc-body"}>
                  <h3 className={"pd-rc-title"}>{r.packageTitle}</h3>
                  <Box className={"pd-rc-footer"}>
                    <span className={"pd-rc-price"}>
                      ${r.packagePrice.toLocaleString()}/mo
                    </span>
                    <ChevronRightIcon className={"pd-rc-arrow"} />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default withLayoutMain(PackageDetailPage);
