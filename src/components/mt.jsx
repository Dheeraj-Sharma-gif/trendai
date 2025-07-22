import { MultiStepLoader } from "./MultiStepLoader";
export const MT = function (){
    const loading = true

  const loadingStates = [
    {
      text: "Searching context",
    },
    {
      text: "Looking for trends",
    },
    {
      text: "Trends found",
    },
    {
      text: "Getting retailers",
    },
    {
      text: "Generating report",
    },
    {
      text: "All done !",
    },
  ];
    return (
        <>
        {loading && (
            <MultiStepLoader
            loadingStates={loadingStates}
            loading={loading}
            duration={2000}
            />
        )}
        </>
    )
}