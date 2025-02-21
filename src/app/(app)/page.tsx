export default async ({ params: paramsPromise }: { params: Promise<{ slug: string[] }> }) => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Your Content Management System</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="mb-4">
            Welcome to your custom content management system. This platform allows you to easily manage and update your website content.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Managing Your Site</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">Pages</h3>
              <p>Create and edit pages through the admin dashboard. Each page can be customized with various content blocks like text, images, and more.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">Content Blocks</h3>
              <p>Use content blocks to build your pages. Available blocks include:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Hero sections for impactful headers</li>
                <li>Text content for articles and information</li>
                <li>Media sections for images and videos</li>
                <li>Custom sections for specific needs</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">Media Library</h3>
              <p>Upload and manage your images, documents, and other media files in the centralized media library.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
          <p>
            If you need assistance or have questions about managing your site, please contact your system administrator or refer to the documentation provided.
          </p>
        </section>
      </div>
    </div>
  )
}
