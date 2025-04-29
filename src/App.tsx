import { useState } from "react";
import {
  MantineProvider,
  Select,
  Slider,
  Radio,
  Container,
  Title,
  Stack,
  rem,
  SegmentedControl,
  Paper,
  Text,
  NumberInput,
} from "@mantine/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const INDEX_TITLE = "Indeks";
const DAYS = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
];
const CLAUDEMIR_OPTIONS = ["Ja", "Nej"];
const GLE_OPTIONS = ["Nej", "Gle", "Gle Gle"];
const indexBaseline = [
  { base: 90, min: 80, max: 140, age: 18 },
  { base: 100, min: 90, max: 150, age: 19 },
  { base: 115, min: 100, max: 150, age: 20 },
  { base: 120, min: 105, max: 150, age: 21 },
  { base: 115, min: 100, max: 150, age: 22 },
  { base: 113, min: 95, max: 140, age: 23 },
  { base: 112, min: 93, max: 140, age: 24 },
  { base: 110, min: 92, max: 140, age: 25 },
  { base: 108, min: 90, max: 140, age: 26 },
  { base: 105, min: 88, max: 140, age: 27 },
  { base: 103, min: 85, max: 140, age: 28 },
  { base: 100, min: 80, max: 135, age: 29 },
  { base: 100, min: 80, max: 145, age: 30 },
  { base: 100, min: 80, max: 135, age: 31 },
  { base: 100, min: 77, max: 135, age: 32 },
  { base: 98, min: 75, max: 135, age: 33 },
  { base: 95, min: 73, max: 130, age: 34 },
  { base: 93, min: 71, max: 130, age: 35 },
  { base: 92, min: 70, max: 130, age: 36 },
  { base: 91, min: 68, max: 130, age: 37 },
  { base: 90, min: 65, max: 130, age: 38 },
  { base: 90, min: 63, max: 130, age: 39 },
  { base: 90, min: 62, max: 145, age: 40 },
  { base: 85, min: 61, max: 125, age: 41 },
  { base: 85, min: 60, max: 125, age: 42 },
  { base: 85, min: 60, max: 125, age: 43 },
  { base: 85, min: 60, max: 125, age: 44 },
  { base: 85, min: 60, max: 125, age: 45 },
  { base: 80, min: 55, max: 125, age: 46 },
  { base: 80, min: 55, max: 125, age: 47 },
  { base: 80, min: 55, max: 125, age: 48 },
  { base: 80, min: 55, max: 125, age: 49 },
  { base: 80, min: 55, max: 145, age: 50 },
];

interface ChartData {
  alder: number;
  storhedsindex: number;
}

function App() {
  const [selectedDay, setSelectedDay] = useState<string>("Fredag");
  const [xIndex, setXIndex] = useState<number>(100);
  const [claudemir, setClaudemir] = useState<string>("Nej");
  const [gle, setGle] = useState<string>("Nej");
  const [viewMode, setViewMode] = useState<"single" | "graph">("single");
  const [selectedAge, setSelectedAge] = useState<number>(25);

  const generateChartData = (): ChartData[] => {
    // Base multipliers for different days
    const oldDayMultipliers: Record<string, number> = {
      Mandag: 1,
      Tirsdag: 1,
      Onsdag: 1,
      Torsdag: 1,
      Fredag: 1.1,
      Lørdag: 1.15,
      Søndag: 0.5,
    };
    const youngDayMultipliers: Record<string, number> = {
      Mandag: 0.9,
      Tirsdag: 0.93,
      Onsdag: 0.96,
      Torsdag: 1.2,
      Fredag: 1.1,
      Lørdag: 1.15,
      Søndag: 0.6,
    };

    // Get day multiplier or default to 1.0
    const dayMultiplier = selectedDay ? oldDayMultipliers[selectedDay] : 1.0;
    const youngDayMultiplier = selectedDay
      ? youngDayMultipliers[selectedDay]
      : 1.0;

    // Claudemir effect (boosts index if present)
    const claudemirBonus = claudemir === "Ja" ? 15 : 0;

    // Gle effect (extreme boost for Gle Gle)
    const gleMultiplier =
      gle === "Gle Gle" ? 1.2 : gle === "Gle" ? 1.1 : gle == "Nej" ? 0.95 : 1.0;

    // Use xIndex to influence overall scale
    const adjustedBase = indexBaseline.map(
      (item) => item.base * 0.2 + xIndex * 0.8
    );
    const minValues = indexBaseline.map((item) => item.min);
    const maxValues = indexBaseline.map((item) => item.max);
    const youngMultiplier = gleMultiplier * youngDayMultiplier;
    const oldMultiplier = gleMultiplier * dayMultiplier;

    const data: ChartData[] = [];
    for (let i = 0; i < adjustedBase.length; i++) {
      const multiplier =
        indexBaseline[i].age < 31 ? youngMultiplier : oldMultiplier;
      const age = indexBaseline[i].age;
      const base = adjustedBase[i];
      const minIndex = minValues[i];
      const maxIndex = maxValues[i];
      const finalIndex = base * multiplier;
      const storhedsindex = Math.min(
        maxIndex,
        Math.max(minIndex, Number(finalIndex.toFixed(1)) + claudemirBonus)
      );

      data.push({
        alder: age,
        storhedsindex: storhedsindex,
      });
    }

    return data;
  };

  // Regenerate chart data when inputs change
  const chartData = generateChartData();
  const allInputsFilled = selectedDay && claudemir && gle;

  const getSingleAgeIndex = (age: number): number => {
    const chartData = generateChartData();
    const ageData = chartData.find((data) => data.alder === age);
    return ageData?.storhedsindex || 0;
  };

  return (
    <MantineProvider
      theme={{
        primaryColor: "blue",
        fontFamily: "Inter, sans-serif",
        components: {
          Container: {
            defaultProps: {
              p: "md",
            },
          },
        },
      }}
    >
      <Container
        size="sm"
        className="py-8 px-4 max-w-full md:max-w-2xl mx-auto"
      >
        <Title order={2} className="text-center mb-6 text-base md:text-lg">
          Hvor Stort Kan Du Gå?
        </Title>

        <Stack gap={rem(16)}>
          <Select
            label="Hvornår skal du ud?"
            data={DAYS}
            value={selectedDay}
            onChange={(value) => setSelectedDay(value || "Fredag")}
            className="w-full"
            required
          />

          <div className="w-full">
            <label className="block mb-2 font-medium">
              Hvad er xIndex for dine venner? (Expected Avg. Index)
            </label>
            <Slider
              value={xIndex}
              onChange={setXIndex}
              min={50}
              max={150}
              className="mt-4"
              marks={[
                { value: 50, label: "50" },
                { value: 100, label: "100" },
                { value: 150, label: "150" },
              ]}
            />
          </div>

          <Radio.Group
            label="Skal Claudemir med dig i byen?"
            value={claudemir}
            onChange={setClaudemir}
            required
            className="w-full"
          >
            <div className="flex gap-4 mt-2">
              {CLAUDEMIR_OPTIONS.map((option) => (
                <Radio key={option} value={option} label={option} />
              ))}
            </div>
          </Radio.Group>

          <Radio.Group
            label="Er du Gle?"
            value={gle}
            onChange={setGle}
            required
            className="w-full"
          >
            <div className="flex gap-4 mt-2">
              {GLE_OPTIONS.map((option) => (
                <Radio key={option} value={option} label={option} />
              ))}
            </div>
          </Radio.Group>

          {allInputsFilled && (
            <>
              <SegmentedControl
                value={viewMode}
                onChange={(value) => setViewMode(value as "single" | "graph")}
                data={[
                  { label: "Tal", value: "single" },
                  { label: "Graf", value: "graph" },
                ]}
                className="self-center mt-4"
              />

              {viewMode === "single" ? (
                <div className="mt-4">
                  <NumberInput
                    label="Alder"
                    value={selectedAge}
                    onChange={(value) => setSelectedAge(Number(value))}
                    min={18}
                    max={50}
                    className="mb-4"
                  />
                  <Paper
                    shadow="sm"
                    p="lg"
                    className="
                      bg-gray-50
                      rounded-lg
                      border border-gray-200
                    "
                  >
                    <Stack gap={rem(6)} align="center">
                      <Text fw={500} size="md" className="text-gray-700">
                        {`Dit ${INDEX_TITLE}:`}
                      </Text>
                      <Text fw={700} size="24px" className="text-gray-900">
                        {getSingleAgeIndex(selectedAge).toFixed(1)}
                      </Text>
                    </Stack>
                  </Paper>
                </div>
              ) : (
                <div className="h-[300px] md:h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 0, left: 10, bottom: 15 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="alder"
                        label={{
                          value: "Alder",
                          position: "insideBottom",
                          offset: -10,
                        }}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        label={{
                          value: INDEX_TITLE,
                          angle: -90,
                          position: "insideLeft",
                          offset: 0,
                        }}
                        tick={{ fontSize: 12 }}
                        domain={[60, 160]}
                        ticks={[60, 80, 100, 120, 140, 160]}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}`, INDEX_TITLE]}
                      />
                      <Line
                        type="monotone"
                        dataKey="storhedsindex"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </Stack>
      </Container>
    </MantineProvider>
  );
}

export default App;
