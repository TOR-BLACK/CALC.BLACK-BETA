import { ROUTE } from "constants/router";
import Notepad from "features/notepad";
import PageContainer from "features/page-container";
import React from "react";

function NotepadPage() {
  return (
    <PageContainer withAuth={true} backRoute={ROUTE.ROOT}>
      <Notepad />
    </PageContainer>
  );
}

export default NotepadPage;
