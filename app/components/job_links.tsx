type Job = {
  company: string;
  title: string;
  url?: string;
  location?: string;
};

type JobLinksProps = {
  jobs: Job[];
};

export default function JobLinks({ jobs }: JobLinksProps) {
  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-6 flex flex-col gap-3">
      {jobs.map((job, i) => (
        <a
          key={i}
          href={job.url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-xl border border-amber-100 hover:bg-amber-50 transition-colors group"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-amber-950 group-hover:underline">
              {job.title}
            </span>
            <div className="flex items-center gap-2 text-xs text-amber-500">
              <span>{job.company}</span>
              {job.location && (
                <>
                  <span>·</span>
                  <span>{job.location}</span>
                </>
              )}
            </div>
          </div>
          <span className="text-amber-400 text-xs">↗</span>
        </a>
      ))}
    </div>
  );
}
