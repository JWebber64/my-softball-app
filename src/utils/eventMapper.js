export const EventMapper = {
  // Calculate which bases should be highlighted
  calculateBasePaths: (events, previousRunners = {}) => {
    const baseConfig = {
      firstBase: false,
      secondBase: false,
      thirdBase: false,
      homePlate: false,
      scored: false,
      // Add new properties for partial lines to show outs
      firstToSecondOut: false,
      secondToThirdOut: false,
      thirdToHomeOut: false
    };

    // Initialize runners with previous state
    let runners = { ...previousRunners };
    let scoredRunners = [];

    console.log('Starting with previous runners:', previousRunners);

    // Process each event sequentially
    for (const event of events) {
      const [baseEvent, ...modifiers] = (event || '').split('(');
      console.log(`Processing ${baseEvent} with current runners:`, runners);
      
      switch (baseEvent) {
        case '1B': {
          // Store current positions before clearing
          const currentRunners = { ...runners };
          runners = {};  // Clear for new positions

          // Advance or score existing runners
          if (currentRunners.third) {
            scoredRunners.push('third');
          }
          if (currentRunners.second) {
            runners.third = true;
          }
          if (currentRunners.first) {
            runners.second = true;
          }
          // Place batter at first
          runners.first = true;
          
          console.log('After single, runners:', runners);
          break;
        }
        case '2B': {
          const currentRunners = { ...runners };
          runners = {};

          if (currentRunners.third) {
            scoredRunners.push('third');
          }
          if (currentRunners.second) {
            scoredRunners.push('second');
          }
          if (currentRunners.first) {
            runners.third = true;
          }
          runners.second = true;
          break;
        }
        case '3B': {
          const currentRunners = { ...runners };
          runners = {};

          if (currentRunners.third) {
            scoredRunners.push('third');
          }
          if (currentRunners.second) {
            scoredRunners.push('second');
          }
          if (currentRunners.first) {
            scoredRunners.push('first');
          }
          runners.third = true;
          break;
        }
        case 'HR': {
          const currentRunners = { ...runners };
          runners = {};

          if (currentRunners.third) {
            scoredRunners.push('third');
          }
          if (currentRunners.second) {
            scoredRunners.push('second');
          }
          if (currentRunners.first) {
            scoredRunners.push('first');
          }
          scoredRunners.push('batter');
          break;
        }
        default:
          console.log(`Unknown event: ${baseEvent}`);
      }
    }

    // Set final base configuration
    if (runners.first) baseConfig.firstBase = true;
    if (runners.second) baseConfig.secondBase = true;
    if (runners.third) baseConfig.thirdBase = true;
    if (scoredRunners.length > 0) baseConfig.scored = true;

    console.log('Final configuration:', { runners, baseConfig });

    return {
      baseConfig,
      runners,
      scoredRunners
    };
  },

  // Maps OCR recognized text to digital sheet events
  mapOCRToDigitalEvent: (ocrEvent) => {
    if (!ocrEvent?.event) return null;

    // Clean up the OCR text and split multiple events
    const eventTexts = ocrEvent.event.trim().toUpperCase().split(',').map(e => e.trim());

    // Map common baseball events
    const eventMappings = {
      'SINGLE': '1B',
      'DOUBLE': '2B',
      'TRIPLE': '3B',
      'HOME RUN': 'HR',
      'HOMERUN': 'HR',
      'STRIKEOUT': 'K',
      'WALK': 'BB',
      'HIT BY PITCH': 'HBP',
      'SACRIFICE': 'SAC',
      'SACRIFICE FLY': 'SF',
      'FIELDERS CHOICE': 'FC',
      'RBI': 'RBI'
    };

    // Convert each event to standard format
    const mappedEvents = eventTexts.map(eventText => 
      eventMappings[eventText] || eventText
    );

    // Calculate base paths using all events
    const basePaths = EventMapper.calculateBasePaths(mappedEvents);

    // Return formatted event
    return {
      events: mappedEvents,
      outDetails: ocrEvent.outDetails || '',
      custom: ocrEvent.custom || '',
      basePaths
    };
  }
};
