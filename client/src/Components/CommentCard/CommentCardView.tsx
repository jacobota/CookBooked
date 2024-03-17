import React from "react";
import { Link } from "react-router-dom";

import { Comment } from "../../types/types";
import DeleteButton from "../Util/DeleteButton/DeleteButton";
import "./CommentCard.css";

// ==================================================

/**
 * The view component for a comment.
 *
 * @param param0 {comment, displayDelete, onDelete}
 * {Comment} comment: the Comment Object to display, which is retrieved from an API response and is the data for a
 * comment entry in the database.
 * {boolean} displayDelete: true to display the delete button.
 * {Function} onDelete: a function for deleting this comment.
 * {boolean} displayDeleteError: true to display an error for when an API request for comment deletion is unsuccessful.
 * @returns JSX component for viewing the comment.
 */
function CommentCardView({
  comment,
  displayDelete = false,
  onDelete: deleteHandler,
  displayDeleteError = false,
}: {
  comment: Comment;
  displayDelete: boolean;
  onDelete: any;
  displayDeleteError: boolean;
}) {
  return (
    <article className="comment-card">
      <div className="comment-card__header">
        <Link to={`/profile/${comment.author}`}>
          <b>{comment.author}</b>
          <img className="profile__picture" src="" alt="Profile Picture" /> {/* TODO */}
        </Link>
      </div>
      <div className="comment-card__body">{comment.content}</div>
      <div className="comment-card__footer">
        <div>{new Date(comment.createdAt).toLocaleString()}</div>
        <div>
          {displayDeleteError && <span>! Try again later.</span>}
          {displayDelete && <DeleteButton onClick={deleteHandler} />}
        </div>
      </div>
    </article>
  );
}

// ==================================================

export default CommentCardView;