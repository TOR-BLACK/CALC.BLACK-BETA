import { ROUTE } from "constants/router";
import NoteForm from "features/note-form";
import PageContainer from "features/page-container";
import React from "react";
import { useParams } from "react-router-dom";
import routerService from "services/router";

interface NotePageParams {
  /** Note id.
   * Without id on the creation page */
  id?: string;
}

function NotePage() {
  const { id } = useParams<"id">() as NotePageParams;

  return (
    <PageContainer
      withAuth={true}
      backRoute={routerService.path(ROUTE.NOTEPAD)}
    >
      <NoteForm id={Number(id)} />
    </PageContainer>
  );
}

export default NotePage;
