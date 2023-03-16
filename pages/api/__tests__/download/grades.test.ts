import { finalScore } from "../../download/grades";

describe("API - Download Gradebook", () => {
  //   const mockRequestResponse = (method: RequestMethod = 'GET') => {
  //   };

  describe("finalScore()", () => {
    const report = {
      grade: {
        score: 50,
      },
    };
    const submission = {
      id: 0,
      isLate: false,
      createdAt: new Date(),
      reports: [report],
      user: {
        itsc: "testITSC",
        name: "testName",
      },
    };

    it("returns same final score as score if no appeal record no change log", () => {
      const fScore = finalScore(submission, report, [], []);
      expect(fScore).toEqual("50");
    });

    it("returns updated final score as score if have appeal record no change log", () => {
      const appeal = {
        submission: {
          reports: [
            {
              grade: {
                score: 70,
              },
            },
          ],
        },
        updatedAt: new Date(),
        user: {
          itsc: "testITSC",
        },
      };

      const fScore = finalScore(submission, report, [appeal], []);
      expect(fScore).toEqual("70");
    });

    it("returns updated final score as score if no appeal record have change log", () => {
      const change = {
        createdAt: new Date(),
        updatedState: {
          score: 80,
        },
        user: {
          itsc: "testITSC",
        },
      };

      const fScore = finalScore(submission, report, [], [change]);
      expect(fScore).toEqual("80");
    });

    it("returns change final score as score if appeal record earlier than change log", () => {
      const appeal = {
        submission: {
          reports: [
            {
              grade: {
                score: 90,
              },
            },
          ],
        },
        updatedAt: new Date(1),
        user: {
          itsc: "testITSC",
        },
      };
      const change = {
        createdAt: new Date(2),
        updatedState: {
          score: 80,
        },
        user: {
          itsc: "testITSC",
        },
      };

      const fScore = finalScore(submission, report, [appeal], [change]);
      expect(fScore).toEqual("80");
    });

    it("returns appeal final score as score if appeal record later than change log", () => {
      const appeal = {
        submission: {
          reports: [
            {
              grade: {
                score: 90,
              },
            },
          ],
        },
        updatedAt: new Date(3),
        user: {
          itsc: "testITSC",
        },
      };
      const change = {
        createdAt: new Date(2),
        updatedState: {
          score: 80,
        },
        user: {
          itsc: "testITSC",
        },
      };

      const fScore = finalScore(submission, report, [appeal], [change]);
      expect(fScore).toEqual("90");
    });
  });
});
