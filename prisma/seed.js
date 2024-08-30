const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Post 1
  await prisma.post.create({
    data: {
      title: 'Understanding JavaScript Closures',
      content: `A closure is the combination of a function and the lexical environment within which that function was declared. Closures are created every time a function is created, at function creation time. The lexical environment consists of any local variables that were in-scope at the time the closure was created. 
      
      JavaScript functions are first-class objects. They are objects, and you can assign them to variables, pass them to other functions, and return them from functions. Closures allow a function to access variables from an enclosing scope or environment, even after it leaves the scope in which it was declared. 
      
      Here’s a simple example of a closure:
      
      \`\`\`
      function outerFunction() {
        let outerVariable = 'I am from outer scope';
        
        function innerFunction() {
          console.log(outerVariable);
        }
        
        return innerFunction;
      }
      
      const closureFunc = outerFunction();
      closureFunc(); // Logs 'I am from outer scope'
      \`\`\`
      
      In the above example, \`innerFunction\` forms a closure. A closure is formed because \`innerFunction\` can access the variables of \`outerFunction\` even after \`outerFunction\` has finished execution.
      
      Closures are particularly useful for data privacy or partial function application. For instance, you can create functions with private variables, like this:
      
      \`\`\`
      function makeCounter() {
        let count = 0;
        return function() {
          count++;
          return count;
        };
      }
      
      const counter = makeCounter();
      console.log(counter()); // 1
      console.log(counter()); // 2
      console.log(counter()); // 3
      \`\`\`
      
      Here, the \`count\` variable is private to the \`makeCounter\` function and cannot be accessed directly from the outside. Each call to the \`counter\` function increments the count variable. This is a powerful pattern in JavaScript, allowing you to create functions that 'remember' state across executions.`,
      published: true,
    },
  });

  // Post 2
  await prisma.post.create({
    data: {
      title: 'The Importance of Database Indexing',
      content: `Database indexing is a technique to improve the performance of a database by reducing the number of disk accesses required when a query is processed. Indexes are special lookup tables that the database search engine can use to speed up data retrieval. Simply put, an index is a pointer to data in a table. Indexes are created on columns in a table.
      
      When a database query is executed, the search engine uses the index to find the data much faster than scanning the entire table. This is similar to the index in a book that helps you quickly find the page number where a particular topic is discussed, rather than having to scan every page in the book.
      
      \`\`\`
      CREATE INDEX idx_column_name ON table_name(column_name);
      \`\`\`
      
      However, indexing is a double-edged sword. While indexes improve the performance of data retrieval operations, they can slow down data modification operations like insertions, updates, and deletions. This is because the database must also modify the index whenever it modifies the data in the table.
      
      Another important aspect to consider is index selectivity. Index selectivity is a measure of how many rows in the table the index points to. If an index has low selectivity, meaning it points to many rows, it may not provide a significant performance benefit. Conversely, highly selective indexes, where each key value corresponds to a small number of rows, tend to be more beneficial.
      
      \`\`\`
      SELECT * FROM users WHERE email = 'example@example.com';
      \`\`\`
      
      In the above query, if there is an index on the \`email\` column, the database can quickly locate the row(s) matching the email, without scanning the entire \`users\` table.
      
      It is also important to know that the placement and creation of indexes should be a thoughtful process. Creating too many indexes can degrade performance, as the database must manage each index. It’s generally a best practice to only index the columns that are frequently used in WHERE clauses, ORDER BY clauses, and JOIN conditions.
      
      Overall, database indexing is a crucial technique for optimizing query performance, but it must be used judiciously. Regular monitoring and adjusting of indexes based on query performance and workload changes are necessary to maintain optimal performance.`,
      published: true,
    },
  });

  // Post 3
  await prisma.post.create({
    data: {
      title: 'Introduction to RESTful APIs',
      content: `REST (Representational State Transfer) is an architectural style for designing networked applications. It relies on a stateless, client-server, cacheable communications protocol -- and in virtually all cases, the HTTP protocol is used. REST is an alternative to SOAP (Simple Object Access Protocol) and provides a simpler and more flexible way to communicate between systems.
      
      RESTful APIs use standard HTTP methods, such as GET, POST, PUT, DELETE, and PATCH, to perform operations on resources. A resource is any kind of object, data, or service that can be accessed by the client. Each resource is identified by a URL, and clients interact with the resources by sending HTTP requests to these URLs.
      
      A key principle of REST is statelessness. This means that each request from a client to a server must contain all of the information the server needs to fulfill the request. The server cannot rely on any previously stored information to handle the request. This makes RESTful services scalable and easier to manage because they do not require session information to be maintained between requests.
      
      \`\`\`
      GET /api/posts - Retrieves a list of posts
      POST /api/posts - Creates a new post
      GET /api/posts/{id} - Retrieves a specific post by ID
      PUT /api/posts/{id} - Updates a specific post by ID
      DELETE /api/posts/{id} - Deletes a specific post by ID
      \`\`\`
      
      RESTful APIs are often designed to be human-readable, meaning that the API endpoints and the structure of the responses are intuitive and easily understandable by developers. This human-readability is one of the reasons why REST has become so popular.
      
      Another important concept in REST is resource representation. When a client requests a resource, the server returns the resource's current state in a representation format, typically JSON or XML. JSON is the most commonly used format due to its simplicity and compatibility with JavaScript, which is widely used in web development.
      
      \`\`\`
      {
        "id": "123",
        "title": "Introduction to RESTful APIs",
        "content": "This is the content of the post.",
        "published": true
      }
      \`\`\`
      
      RESTful APIs are designed to be stateless, cacheable, and have a uniform interface. The simplicity and flexibility of REST make it an ideal choice for building APIs for web and mobile applications. As REST continues to evolve, it remains a fundamental building block in the development of distributed systems.`,
      published: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
