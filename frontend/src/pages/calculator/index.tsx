import Calculator from "features/calculator";
import PageContainer from "features/page-container";

function CalculatorPage() {
  return (
    <PageContainer calcPage={true} isStretch={true}>
      <Calculator />
    </PageContainer>
  );
}

export default CalculatorPage;
