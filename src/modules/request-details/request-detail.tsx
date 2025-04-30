"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";
import { format } from "date-fns";

interface Comment {
  id: string;
  text: string;
  userId: string;
  requestId: string;
  createdAt: string;
  modifiedAt: string;
  user: {
    username: string;
    fullname: string;
  };
}

interface Request {
  id: string;
  userId: string;
  medicalEquipment: string;
  complaint: string;
  status: string;
  createdBy: string;
  createdOn: string;
  modifiedBy: string;
  modifiedOn: string;
  requestType: string;
  user: {
    username: string;
    fullname: string;
  };
}

export default function RequestDetail({ id, requestType }: { 
  id: string; 
  requestType: 'CALIBRATION' | 'MAINTENANCE'
}) {
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch request details
  useEffect(() => {
    async function fetchRequestDetails() {
      try {
        const token = Cookies.get("accessToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/request/${id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch request details");
        }

        const responseData = await response.json();
        
        // Handle the nested structure from your API
        if (responseData.success && responseData.data) {
          setRequest(responseData.data);
          
          // If comments are included in the request response, set them too
          if (responseData.data.comments && Array.isArray(responseData.data.comments)) {
            setComments(responseData.data.comments);
            setLoading(false); // Skip comments fetch if we already have them
          }
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        toast.error("Failed to load request details");
      }
    }

    fetchRequestDetails();
  }, [id]);

  // Fetch comments (only if not already loaded from request)
  useEffect(() => {
    // Skip if we already have comments from the request details
    if (!loading || comments.length > 0) return;
    
    async function fetchComments() {
      try {
        const token = Cookies.get("accessToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/comment/request/${id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const responseData = await response.json();
        
        // Handle the nested structure from your API
        if (responseData.success && Array.isArray(responseData.data)) {
          setComments(responseData.data);
        } else if (responseData.data && Array.isArray(responseData.data)) {
          setComments(responseData.data);
        } else if (responseData.data?.comments && Array.isArray(responseData.data.comments)) {
          setComments(responseData.data.comments);
        } else {
          console.error("Unexpected comment data format:", responseData);
          setComments([]);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast.error("Failed to load comments: " + error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [id, loading, comments.length]);

  const handleBack = () => {
    router.back();
  };

  // Update the handleSubmitComment function
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const token = Cookies.get("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/comment`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: newComment,
            requestId: id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const responseData = await response.json();
      
      // Extract the actual comment data from the response
      const newCommentData = responseData.data || responseData;
      
      // Add properly formatted comment to the list
      setComments(prev => [...prev, newCommentData]);
      setNewComment("");
      toast.success("Comment added successfully");
      
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment" + error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm");
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" data-testid="loading-state">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }

  const requestTypeText = requestType === 'CALIBRATION' ? 'Calibration' : 'Maintenance';

  return (
    <div className="space-y-6 font-plus-jakarta-sans">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={handleBack} className="p-0 h-auto">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-header-h5 font-bold font-poppins">
          {requestTypeText} Request Detail
        </h1>
      </div>

      {request && (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Request Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Request ID</p>
              <p className="font-medium" data-testid="request-id">{request.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : request.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : request.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  data-testid="request-status"
                >
                  {request.status}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Requestor</p>
              <p className="font-medium" data-testid="request-user">
                {request.user?.fullname || request.user?.username || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Submission Date</p>
              <p className="font-medium" data-testid="request-date">
                {formatDate(request.createdOn)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Medical Equipment</p>
              <p className="font-medium" data-testid="request-equipment">
                {request.medicalEquipment}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium" data-testid="request-modified">
                {formatDate(request.modifiedOn)}
              </p>
            </div>
          </div>

          {/* Complaint */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Complaint</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <p data-testid="request-complaint">
                {request.complaint || "No complaint specified"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Comments</h2>

        {/* Comments List */}
        <div className="space-y-4 mb-6" data-testid="comments-list">
          {comments.length === 0 ? (
            <p className="text-gray-500 italic">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 p-4 rounded-md space-y-2"
                data-testid={`comment-${comment.id}`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium">
                    {comment.user?.fullname || comment.user?.username || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
                <p>{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmitComment} className="mt-6">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                className="resize-none"
                disabled={submitting}
                data-testid="comment-input"
              />
            </div>
            <Button 
              type="submit" 
              disabled={submitting || !newComment.trim()}
              data-testid="submit-comment"
            >
              {submitting ? "Sending..." : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}