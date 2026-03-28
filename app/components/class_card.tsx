type GradeBreakdown = {
  category: string;
  weight: number;
};

type ClassCardProps = {
  courseName: string;
  courseCode: string;
  lectures: { day: string; time: string }[];
  officeHours: { day: string; time: string; instructor?: string }[];
  grading: GradeBreakdown[];
  drops: string;
};

export default function ClassCard({
  courseName,
  courseCode,
  lectures,
  officeHours,
  grading,
  drops, 
}: ClassCardProps) {
  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-6 flex flex-col gap-5">
      <div>
        <span className="text-xs font-mono text-amber-400">{courseCode}</span>
        <h3 className="text-base font-semibold text-amber-950 mt-0.5">{courseName}</h3>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-2">Lectures</h4>
        <ul className="flex flex-col gap-1">
          {lectures.map((l, i) => (
            <li key={i} className="text-sm text-amber-800">
              {l.day} &mdash; {l.time}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-2">Office Hours</h4>
        <ul className="flex flex-col gap-1">
          {officeHours.map((o, i) => (
            <li key={i} className="text-sm text-amber-800">
              {o.day} &mdash; {o.time}
              {o.instructor && <span className="text-amber-400 ml-1">({o.instructor})</span>}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-2">Grading</h4>
        <ul className="flex flex-col gap-1.5">
          {grading.map((g, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="text-amber-800">{g.category}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 rounded-full bg-amber-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-700"
                    style={{ width: `${g.weight}%` }}
                  />
                </div>
                <span className="text-amber-500 text-xs w-8 text-right">{g.weight}%</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-2">Drops</h4>
        <p className="text-sm text-amber-800">{drops}</p>
      </div>
    </div>
  );
}
