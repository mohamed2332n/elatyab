import { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProtectedMutation } from '@/hooks/use-protected-mutation';
import { toast } from 'sonner';

// Example API service with CSRF protection
const apiService = {
  // Example POST request with CSRF protection
  createItem: async (data: unknown) => {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection header
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create item');
    }
    
    return response.json();
  },
  
  // Example DELETE request with CSRF protection
  deleteItem: async (id: string) => {
    const response = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection header
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete item');
    }
    
    return response.json();
  }
};

const Index = () => {
  const [items, setItems] = useState<string[]>(['Item 1', 'Item 2', 'Item 3']);
  
  // Protected mutation for creating items
  const createItemMutation = useProtectedMutation({
    mutationFn: apiService.createItem,
    onSuccess: () => {
      toast.success('Item created successfully');
      // In a real app, you would update the UI with the new item
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
  
  // Protected mutation for deleting items
  const deleteItemMutation = useProtectedMutation({
    mutationFn: apiService.deleteItem,
    onSuccess: () => {
      toast.success('Item deleted successfully');
      // In a real app, you would update the UI to remove the item
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
  
  const handleCreateItem = () => {
    createItemMutation.mutate({ name: `Item ${items.length + 1}` });
  };
  
  const handleDeleteItem = (id: string) => {
    deleteItemMutation.mutate(id);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Secure Application</h1>
          <p className="text-lg text-gray-600 mb-6">
            This application implements CSRF protection for all state-changing operations
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Security Note:</strong> All POST, PUT, and DELETE requests include CSRF protection headers
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Protected Actions</CardTitle>
              <CardDescription>
                These actions are protected against CSRF attacks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleCreateItem}
                disabled={createItemMutation.isPending}
                className="w-full"
              >
                {createItemMutation.isPending ? 'Creating...' : 'Create New Item'}
              </Button>
              
              <div className="pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Current Items</h3>
                <ul className="space-y-2">
                  {items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                      <span>{item}</span>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteItem(index.toString())}
                        disabled={deleteItemMutation.isPending}
                      >
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Security Implementation</CardTitle>
              <CardDescription>
                How CSRF protection is implemented
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Custom Headers</h4>
                  <p className="text-sm text-blue-700">
                    All state-changing requests include the header:
                    <code className="block bg-white p-2 mt-1 rounded">X-Requested-With: XMLHttpRequest</code>
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Protected Hooks</h4>
                  <p className="text-sm text-green-700">
                    Using <code className="bg-white px-1 rounded">useProtectedMutation</code> hook for all mutations
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Server Validation</h4>
                  <p className="text-sm text-purple-700">
                    Backend should validate the presence of CSRF headers before processing requests
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12 text-center">
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );
};

export default Index;