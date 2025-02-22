const ScoreSheetsPage = () => {
  const [scoreSheetData, setScoreSheetData] = useState({});

  return (
    <div>
      <DigitalScoreSheet 
        data={scoreSheetData}
        onDataChange={setScoreSheetData}
      />
    </div>
  );
};
