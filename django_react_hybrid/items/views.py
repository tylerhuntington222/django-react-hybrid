from django.views.generic import TemplateView
from django.shortcuts import render

class ItemsView(TemplateView):
    title = 'Item List'
    template = 'pages/items.html'
    component = 'ItemsPage.js'

    def get(self, request):
        # gets passed to react via window.props
        props = {
            'items': [
                {'name': 'bicycle', 'color': 'red', 'quantity': 1},
                {'name': 'computer', 'color': 'silver', 'quantity': 3},
                {'name': 'phone', 'color': 'black', 'quantity': 2},
                {'name': 'elephant', 'color': 'gray', 'quantity': 5},
            ]
        }

        context = {
            'title': self.title,
            'component': self.component,
            'props': props,
        }

        return render(request, self.template, context)
