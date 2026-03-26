export const TECH_KEYWORDS = new Set([
  // ── Web Frontend ──
  "react","angular","vue","nextjs","nuxtjs","svelte","html","css","javascript",
  "typescript","tailwind","bootstrap","sass","scss","webpack","vite","redux",
  "contextapi","zustand","css-in-js","styled-components","framer","motion",
  "responsive","accessibility","pwa","spa","ssr","seo",
    "tanstack", "react-query", "recoil", "jotai", "signals", "embla", "shadcn", "radix", 
"headless", "micro-frontends", "module-federation", "storybook", "playwright", 
"vitest", "remix", "astro", "qwik", "solidjs", "deno", "bun", "clerk", "kinde",


  // ── Web Backend ──
  "node","nodejs","express","nestjs","fastapi","django","flask","spring",
  "laravel","rails","graphql","restful","api","apis","microservices","websocket",
  "authentication","authorization","jwt","oauth","middleware","serverless",
  "trpc", "grpc", "protobuf", "rabbitmq", "bullmq", "redis-streams", "socket.io", 
"web-workers", "cron", "webhook", "idempotency", "rate-limiting", "helmet", 
"morgan", "passport", "lucia-auth", "zod", "yup", "joi",


  // ── Databases ──
  "mongodb","postgresql","mysql","sqlite","redis","firebase","supabase",
  "dynamodb","cassandra","elasticsearch","prisma","mongoose","sequelize","orm",
  "sql","nosql","database","schema","query","indexing","migration",
  "planetscale", "neon", "cockroachdb", "surrealdb", "fauna", "meilisearch", "algolia", 
"solr", "clickhouse", "influxdb", "timescaledb", "graph-database", "neo4j", 
"dgraph", "acid", "sharding", "replication",

  // ── AI / ML / Data Science ──
  "python","tensorflow","pytorch","keras","scikit-learn","sklearn","numpy",
  "pandas","matplotlib","seaborn","jupyter","nlp","computer-vision","cv",
  "deep-learning","machine-learning","neural-network","transformers","bert",
  "llm","generative","ai","artificial-intelligence","reinforcement-learning",
  "feature-engineering","model","training","inference","deployment","mlops",
  "huggingface","openai","langchain","rag","embeddings","vectordb","pinecone",
  "vector-search", "semantic-search", "prompt-engineering", "fine-tuning", "lora", 
"quantization", "onnx", "tensorrt", "cuda", "ollama", "mistral", "llama", "claude", 
"gemini", "stable-diffusion", "midjourney", "whisper", "vector-embeddings",

  // ── Data Analytics / BI ──
  "sql","tableau","powerbi","looker","excel","data-analysis","analytics",
  "visualization","dashboard","etl","pipeline","airflow","spark","hadoop",
  "hive","kafka","dbt","snowflake","bigquery","redshift","data-warehouse",
  "statistics","hypothesis","regression","classification","clustering","a/b",

  // ── DevOps / Cloud ──
  "docker","kubernetes","jenkins","github-actions","gitlab-ci","circleci",
  "terraform","ansible","helm","nginx","linux","bash","shell","ci/cd","cicd",
  "aws","azure","gcp","cloud","s3","ec2","lambda","cloudfront","iam",
  "monitoring","logging","prometheus","grafana","elk","datadog","sentry",
  "infrastructure","deployment","scaling","load-balancer","microservices",
  "vercel", "netlify", "railway", "render", "digitalocean", "heroku", "linode", 
"cloud-native", "iam", "secrets-management", "vault", "sonarqube", "docker-compose", 
"podman", "k3s", "istio", "envoy", "cloudflare-workers",

  // ── Mobile ──
  "react-native","flutter","swift","kotlin","android","ios","expo","xcode",
  "mobile","app","native","cross-platform",
  "electron", "tauri", "capacitor", "cordova", "pwa", "expo-router", "native-wind", 
"skia", "unity", "unreal-engine",

  // ── General Programming ──
  "java","c++","c#","golang","go","rust","php","ruby","scala","kotlin",
  "git","github","gitlab","bitbucket","agile","scrum","jira","linux",
  "algorithms","data-structures","oop","functional","solid","design-patterns",
  "testing","jest","pytest","junit","mocha","cypress","selenium","tdd","bdd",
  "code-review","reviews","documentation","debugging","performance",

  // ── Cybersecurity ──
  "security","encryption","ssl","tls","penetration","vulnerability","firewall",
  "oauth","sso","compliance","gdpr","owasp","zero-trust",

  // ── Soft / Universal Keywords ──
  "scalable","modular","secure","clean","reusable","maintainable","documented",
  "asynchronous","optimization","architecture","stability","quality","agile",
  "collaborate","communication","problem-solving","analytical","leadership",
  "fullstack","full-stack","frontend","backend","engineer","developer",
  "solutions","driven","build","deploy","integrate","design","implement",
  "web","applications","development","frameworks","systems","platform",
  "assurance","planning","code","testing","research","analysis","model",
  "mvc", "mvvm", "event-driven", "pub-sub", "cqrs", "ddd", "clean-architecture", 
"hexagonal-architecture", "monolith", "server-actions", "ssr", "isg", "isr", 
"hydration", "virtualization", "concurrency", "parallelism",
]);

export const filterValidSkills = (skillsArray) => {
  if (!Array.isArray(skillsArray)) return [];
  return skillsArray
    .map(s => String(s).toLowerCase().trim())
    .filter(s => TECH_KEYWORDS.has(s) && s.length > 1);
};

